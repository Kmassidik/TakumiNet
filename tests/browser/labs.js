(() => {
  "use strict";

  const PORTS = Array.from({ length: 20 }, (_, index) => 39101 + index);
  const nativeFetch = window.fetch.bind(window);

  function memoryStorage() {
    const values = new Map();
    return {
      get length() {
        return values.size;
      },
      key(index) {
        return Array.from(values.keys())[index] ?? null;
      },
      getItem(key) {
        key = String(key);
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        values.set(String(key), String(value));
      },
      removeItem(key) {
        values.delete(String(key));
      },
      clear() {
        values.clear();
      },
    };
  }

  function decodeBase64(value) {
    const binary = atob(value || "");
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  function encodeBase64(bytes) {
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  }

  function errorText(error) {
    return error instanceof Error ? error.stack || error.message : String(error);
  }

  function mismatch(lab, recordIndex, field, expected, actual) {
    const detail = {
      response: recordIndex + 1,
      field,
      expected,
      actual,
    };
    lab.mismatches.push(detail);
    console.error(`[P5 ${lab.port} response ${recordIndex + 1}] ${field}`, detail);
  }

  function compareBytes(lab, recordIndex, field, expected, actual) {
    if (expected.length === actual.length && expected.every((byte, i) => byte === actual[i])) {
      return;
    }
    mismatch(lab, recordIndex, field, encodeBase64(expected), encodeBase64(actual));
  }

  async function loadFixture(port) {
    const response = await nativeFetch(`/tests/fixtures/labs/${port}.jsonl`);
    if (!response.ok) {
      throw new Error(`fixture HTTP ${response.status} for ${port}.jsonl`);
    }
    const text = await response.text();
    return text.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`invalid JSONL at ${port}.jsonl:${index + 1}: ${errorText(error)}`);
      }
    });
  }

  async function replayLab(port) {
    const lab = {
      port,
      ok: false,
      mode: null,
      responses: 0,
      mismatches: [],
      error: null,
    };

    try {
      const records = await loadFixture(port);
      const engine = window.TakumiEngine.create({
        nativeFetch,
        storage: memoryStorage(),
        wasmUrl: "/web/engine.wasm",
      });
      await engine.ready;
      lab.mode = engine.mode;
      if (engine.mode !== "wasm") {
        throw new Error(`expected WASM mode, received ${JSON.stringify(engine.mode)}`);
      }

      for (let index = 0; index < records.length; index += 1) {
        const record = records[index];
        const expectedBody = decodeBase64(record.body);
        const expectedResponse = decodeBase64(record.response);
        const init = { method: record.method };
        if (expectedBody.length) {
          init.body = expectedBody;
        }

        let observedRequest;
        const response = await (async () => {
          observedRequest = {
            method: init.method,
            target: record.target,
            body: init.body || new Uint8Array(),
          };
          return engine.fetch(record.target, init);
        })();

        if (observedRequest.method !== record.method) {
          mismatch(lab, index, "request.method", record.method, observedRequest.method);
        }
        if (observedRequest.target !== record.target) {
          mismatch(lab, index, "request.target", record.target, observedRequest.target);
        }
        compareBytes(lab, index, "request.body", expectedBody, observedRequest.body);
        if (response.status !== record.status) {
          mismatch(lab, index, "status", record.status, response.status);
        }
        const contentType = response.headers.get("content-type") || "";
        if (contentType !== (record.contentType || "")) {
          mismatch(lab, index, "contentType", record.contentType || "", contentType);
        }
        compareBytes(
          lab,
          index,
          "response",
          expectedResponse,
          new Uint8Array(await response.arrayBuffer()),
        );
        lab.responses += 1;
      }
      lab.ok = lab.mismatches.length === 0;
    } catch (error) {
      lab.error = errorText(error);
      console.error(`[P5 ${port}] replay failed`, error);
    }
    return lab;
  }

  async function run() {
    const results = {
      ok: false,
      total: PORTS.length,
      passed: 0,
      failed: 0,
      labs: [],
    };
    window.P5_RESULTS = results;

    try {
      for (const port of PORTS) {
        const lab = await replayLab(port);
        results.labs.push(lab);
        if (lab.ok) {
          results.passed += 1;
        } else {
          results.failed += 1;
        }
      }
      results.ok = results.failed === 0;
    } catch (error) {
      results.error = errorText(error);
      console.error("[P5] replay harness failed", error);
    } finally {
      window.P5_RESULTS = results;
      document.getElementById("results").textContent = JSON.stringify(results, null, 2);
      document.body.dataset.done = "true";
    }
  }

  run();
})();
