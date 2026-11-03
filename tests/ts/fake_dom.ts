import type { DocLike, ElementLike, EventLike } from "../../web/ts/ui/dom";

export class FakeElement implements ElementLike {
  textContent: string | null = "";
  title = "";
  className = "";
  value = "";
  disabled = false;
  children: FakeElement[] = [];
  private parent: FakeElement | null = null;
  private attrs = new Map<string, string>();
  private listeners = new Map<string, Array<(event: EventLike) => void>>();

  constructor(readonly tagName: string) {}

  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attrs.get(name) ?? null;
  }

  addEventListener(type: string, handler: (event: EventLike) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), handler]);
  }

  appendChild<T extends ElementLike>(child: T): T {
    const element = child as unknown as FakeElement;
    element.remove();
    element.parent = this;
    this.children.push(element);
    return child;
  }

  focus(): void {}
  select(): void {}
  remove(): void {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }

  dispatch(type: string, event: Partial<EventLike>): void {
    for (const handler of this.listeners.get(type) ?? []) {
      handler({ key: "", target: this, preventDefault() {}, ...event });
    }
  }

  click(): void {
    if (this.disabled) return;
    for (const handler of this.listeners.get("click") ?? []) {
      handler({ key: "", target: this, preventDefault() {} });
    }
  }
}

export class FakeDocument implements DocLike {
  body = new FakeElement("body");
  activeElement: ElementLike | null = null;

  createElement(tag: string): FakeElement {
    return new FakeElement(tag);
  }
}
