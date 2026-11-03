import { expect, test } from "bun:test";
import { buildRunLog, formatLogLine, type RunEvent } from "../../web/ts/ui/run_log";

const events: RunEvent[] = [
  { id: 1, time: 0.001, last: "PC0", at: "Switch0", type: "ICMP", proto: "ICMP", path: ["PC0", "Switch0"] },
  { id: 2, time: 0.004, last: "Switch0", at: "Router0", type: "ICMP", proto: "ICMP", path: [] },
  { id: 3, time: 0.009, last: "Router0", at: "PC3", type: "UDP", proto: "UDP", path: [] },
];

test("each simulated event becomes one log entry, in time order", () => {
  const log = buildRunLog(events, [], "");
  expect(log.map((e) => e.id)).toEqual([1, 2, 3]);
  expect(log[0]!.device).toBe("Switch0");
});

test("command output is merged into the same timeline by time", () => {
  const commands = [{ time: 0.002, device: "PC0", action: "ping 192.168.1.4", result: "Reply from 192.168.1.4" }];
  const log = buildRunLog(events, commands, "");
  expect(log.map((e) => e.device)).toEqual(["Switch0", "PC0", "Router0", "PC3"]);
  expect(log.find((e) => e.action === "ping 192.168.1.4")?.result).toBe("Reply from 192.168.1.4");
});

test("filtering keeps entries whose device or action contains the text, case-insensitive", () => {
  const log = buildRunLog(events, [], "router");
  expect(log.map((e) => e.device)).toEqual(["Router0", "PC3"]);
  expect(buildRunLog(events, [], "")).toHaveLength(3);
});

test("a log line reads time, device, action and result", () => {
  const line = formatLogLine({ time: 0.004, device: "Router0", action: "ICMP to PC3", result: "forwarded" });
  expect(line).toBe("0.004  Router0  ICMP to PC3  forwarded");
});
