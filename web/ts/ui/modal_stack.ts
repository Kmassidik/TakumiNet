export interface Focusable {
  focus(): void;
}

export interface ModalEntry {
  id: string;
  opener?: Focusable;
  onClose: () => void;
}

export class ModalStack {
  private entries: ModalEntry[] = [];

  get size(): number {
    return this.entries.length;
  }

  push(entry: ModalEntry): void {
    this.entries.push(entry);
  }

  has(id: string): boolean {
    return this.entries.some((entry) => entry.id === id);
  }

  forget(id: string): boolean {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index < 0) return false;
    this.entries.splice(index, 1);
    return true;
  }

  escape(): boolean {
    return this.close();
  }

  close(): boolean {
    const top = this.entries.pop();
    if (!top) return false;
    top.onClose();
    top.opener?.focus();
    return true;
  }
}
