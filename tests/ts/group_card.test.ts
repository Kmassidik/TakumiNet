import { expect, test } from "bun:test";
import { makeGroupPress, renderGroupCard, type GroupLike } from "../../web/ts/ui/group_card";
import { FakeDocument, FakeElement } from "./fake_dom";
import { allText, flush } from "./kind_test_helpers";

const group: GroupLike = { id: "group0", name: "Office", devices: 3, status: "degraded" };

test("the card names the group, counts its devices and explains the status", () => {
  const doc = new FakeDocument();
  const body = new FakeElement("div");
  renderGroupCard(doc, body, group);
  const text = allText(body);
  expect(text).toContain("Office");
  expect(text).toContain("3 devices inside");
  expect(text).toContain("Degraded: a device inside has a port down");
});

function pressHarness(response: Record<string, unknown> = { devices: [] }) {
  const calls: string[] = [];
  const cards: GroupLike[] = [];
  const applied: Record<string, unknown>[] = [];
  let clock = 0;
  const press = makeGroupPress({
    now: () => clock,
    post: async (path) => {
      calls.push(path);
      return response;
    },
    card: (g) => cards.push(g),
    applied: (res) => applied.push(res),
  });
  return { press, calls, cards, applied, tick: (ms: number) => { clock += ms; } };
}

test("one press opens the card; a quick second press posts the expand and hands the workspace on", async () => {
  const { press, calls, cards, applied, tick } = pressHarness();
  press(group);
  expect(cards).toHaveLength(1);
  tick(200);
  press(group);
  await flush();
  expect(calls).toEqual(["/api/groups/expand?id=group0"]);
  expect(applied).toHaveLength(1);
  expect(cards).toHaveLength(1);
});

test("a slow second press is a fresh single press, not an expand", async () => {
  const { press, calls, cards, tick } = pressHarness();
  press(group);
  tick(1000);
  press(group);
  await flush();
  expect(calls).toEqual([]);
  expect(cards).toHaveLength(2);
});

test("a failed expand never applies the response", async () => {
  const { press, applied, tick } = pressHarness({ error: "no such group" });
  press(group);
  tick(100);
  press(group);
  await flush();
  expect(applied).toEqual([]);
});
