export interface RunEvent {
  id: number;
  time: number;
  last: string;
  at: string;
  type: string;
  proto: string;
  path: string[];
}

export interface CommandRecord {
  time: number;
  device: string;
  action: string;
  result: string;
}

export interface LogEntry {
  id?: number;
  time: number;
  device: string;
  action: string;
  result: string;
}

export function buildRunLog(events: RunEvent[], commands: CommandRecord[], query: string): LogEntry[] {
  const fromEvents: LogEntry[] = events.map((e) => ({
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

export function formatLogLine(entry: LogEntry): string {
  return `${entry.time.toFixed(3)}  ${entry.device}  ${entry.action}  ${entry.result}`;
}
