export function buildRunLog(events, commands, query) {
  const fromEvents = events.map((e) => ({
    id: e.id,
    time: e.time,
    device: e.at,
    action: `${e.type} from ${e.last}`,
    result: e.path.length ? e.path.join(" > ") : `at ${e.at}`,
  }));
  const needle = query.trim().toLowerCase();
  return [...fromEvents, ...commands]
    .filter((e) => !needle || `${e.device} ${e.action} ${e.result}`.toLowerCase().includes(needle))
    .sort((a, b) => a.time - b.time);
}

export function formatLogLine(entry) {
  return `${entry.time.toFixed(3)}  ${entry.device}  ${entry.action}  ${entry.result}`;
}
