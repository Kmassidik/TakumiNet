(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) {
    root.captureRows = api.captureRows;
    root.applyCaptureFilter = api.applyCaptureFilter;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PROTOCOLS = new Set(['icmp', 'arp', 'tcp', 'udp', 'http', 'dns', 'dhcp']);
  const FIELDS = new Set(['ip.src', 'ip.dst', 'eth.addr', 'ttl']);
  const COMPARISONS = new Set(['==', '!=', '<', '<=', '>', '>=']);

  function captureRows(events) {
    return (Array.isArray(events) ? events : [])
      .map((event, index) => ({ event, index }))
      .sort((a, b) => (a.event.time - b.event.time) || (a.index - b.index))
      .map(({ event }) => ({ event }));
  }

  function tokenize(source) {
    const tokens = [];
    let i = 0;
    while (i < source.length) {
      if (/\s/.test(source[i])) {
        i += 1;
        continue;
      }
      const position = i + 1;
      const pair = source.slice(i, i + 2);
      if (['&&', '||', '==', '!=', '<=', '>='].includes(pair)) {
        tokens.push({ type: pair, position });
        i += 2;
        continue;
      }
      if (['!', '<', '>', '(', ')'].includes(source[i])) {
        tokens.push({ type: source[i], position });
        i += 1;
        continue;
      }
      if (['=', '&', '|'].includes(source[i])) {
        throw new Error(`Invalid operator at position ${position}`);
      }
      const start = i;
      while (i < source.length && !/[\s()&|=!<>]/.test(source[i])) i += 1;
      tokens.push({ type: 'word', value: source.slice(start, i), position });
    }
    tokens.push({ type: 'end', position: source.length + 1 });
    return tokens;
  }

  function parse(source) {
    const tokens = tokenize(source);
    let cursor = 0;

    function current() {
      return tokens[cursor];
    }

    function take(type) {
      if (current().type !== type) return null;
      const token = current();
      cursor += 1;
      return token;
    }

    function expected(description) {
      const token = current();
      const found = token.type === 'end' ? 'end of filter' : `"${token.value || token.type}"`;
      throw new Error(`Expected ${description} at position ${token.position}, found ${found}`);
    }

    function primary() {
      if (take('!')) return { kind: 'not', operand: primary() };
      if (take('(')) {
        const expression = disjunction();
        if (!take(')')) expected('")"');
        return expression;
      }

      const word = take('word');
      if (!word) expected('a protocol, field, "!", or "("');
      const name = word.value.toLowerCase();
      if (PROTOCOLS.has(name)) return { kind: 'protocol', name };
      if (!FIELDS.has(name)) {
        throw new Error(`Unknown protocol or field "${word.value}" at position ${word.position}`);
      }

      const operator = current();
      if (!COMPARISONS.has(operator.type)) expected('a comparison operator');
      cursor += 1;
      if (name !== 'ttl' && !['==', '!='].includes(operator.type)) {
        throw new Error(`Field "${name}" only supports == and != at position ${operator.position}`);
      }
      const value = take('word');
      if (!value) expected('a comparison value');
      if (name === 'ttl') {
        const number = Number(value.value);
        if (!Number.isFinite(number)) {
          throw new Error(`TTL comparison requires a number at position ${value.position}`);
        }
        return { kind: 'ttl', operator: operator.type, value: number };
      }
      return { kind: 'address', field: name, operator: operator.type, value: value.value.toLowerCase() };
    }

    function conjunction() {
      let expression = primary();
      while (take('&&')) expression = { kind: 'and', left: expression, right: primary() };
      return expression;
    }

    function disjunction() {
      let expression = conjunction();
      while (take('||')) expression = { kind: 'or', left: expression, right: conjunction() };
      return expression;
    }

    const expression = disjunction();
    if (current().type !== 'end') expected('end of filter');
    return expression;
  }

  function protocolNames(event) {
    const names = [];
    if (!event || typeof event !== 'object') return names;
    for (const value of [event.type, event.proto, event.protocol]) {
      if (typeof value === 'string') names.push(value.toLowerCase());
    }
    const layers = Array.isArray(event.layers) ? event.layers : [];
    for (const layer of layers) {
      if (layer && typeof layer.name === 'string') names.push(layer.name.toLowerCase());
    }
    return names;
  }

  function addressValues(event, field) {
    const values = [];
    if (!event || typeof event !== 'object') return values;
    const hops = Array.isArray(event.hops) ? event.hops : [];
    for (const hop of hops) {
      if (!hop || typeof hop !== 'object') continue;
      if (field === 'eth.addr') {
        if (hop.srcMac != null) values.push(String(hop.srcMac).toLowerCase());
        if (hop.dstMac != null) values.push(String(hop.dstMac).toLowerCase());
      } else {
        const key = field === 'ip.src' ? 'srcIp' : 'dstIp';
        if (hop[key] != null) values.push(String(hop[key]).toLowerCase());
      }
    }
    return values;
  }

  function compareNumber(actual, operator, expected) {
    if (operator === '==') return actual === expected;
    if (operator === '!=') return actual !== expected;
    if (operator === '<') return actual < expected;
    if (operator === '<=') return actual <= expected;
    if (operator === '>') return actual > expected;
    return actual >= expected;
  }

  function matches(expression, event) {
    switch (expression.kind) {
      case 'not': return !matches(expression.operand, event);
      case 'and': return matches(expression.left, event) && matches(expression.right, event);
      case 'or': return matches(expression.left, event) || matches(expression.right, event);
      case 'protocol': return protocolNames(event).includes(expression.name);
      case 'address': {
        const values = addressValues(event, expression.field);
        return values.some((value) => expression.operator === '=='
          ? value === expression.value
          : value !== expression.value);
      }
      case 'ttl': {
        const hops = event && Array.isArray(event.hops) ? event.hops : [];
        return hops.some((hop) => {
          if (!hop || hop.ttl == null || hop.ttl === '') return false;
          const actual = Number(hop.ttl);
          return Number.isFinite(actual) && compareNumber(actual, expression.operator, expression.value);
        });
      }
      default: return false;
    }
  }

  function applyCaptureFilter(events, source) {
    if (typeof source !== 'string' || !source.trim()) {
      return { events, error: 'Filter is empty' };
    }
    try {
      const expression = parse(source);
      const input = Array.isArray(events) ? events : [];
      return { events: input.filter((event) => matches(expression, event)), error: '' };
    } catch (error) {
      return { events, error: error instanceof Error ? error.message : 'Invalid capture filter' };
    }
  }

  return { captureRows, applyCaptureFilter };
});
