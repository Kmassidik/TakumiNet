export interface EventLike {
  key: string;
  target: ElementLike | null;
  preventDefault(): void;
}

export interface ElementLike {
  tagName: string;
  textContent: string | null;
  title: string;
  className: string;
  value: string;
  disabled: boolean;
  dataset: Record<string, string | undefined>;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  addEventListener(type: string, handler: (event: EventLike) => void): void;
  appendChild<T extends ElementLike>(child: T): T;
  focus(): void;
  select(): void;
  remove(): void;
  replaceChildren(): void;
}

export interface DocLike {
  createElement(tag: string): ElementLike;
  createElementNS?(namespace: string, tag: string): ElementLike;
  body: ElementLike;
  activeElement: ElementLike | null;
}
