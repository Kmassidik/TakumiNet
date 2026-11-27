export class ModalStack {
  entries = [];

  get size() {
    return this.entries.length;
  }

  push(entry) {
    this.entries.push(entry);
  }

  has(id) {
    return this.entries.some((entry) => entry.id === id);
  }

  forget(id) {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index < 0) return false;
    this.entries.splice(index, 1);
    return true;
  }

  escape() {
    return this.close();
  }

  /* Close one named dialog, wherever it sits in the stack. */
  closeById(id) {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index < 0) return false;
    const [entry] = this.entries.splice(index, 1);
    entry.onClose();
    entry.opener?.focus();
    return true;
  }

  close() {
    const top = this.entries.pop();
    if (!top) return false;
    top.onClose();
    top.opener?.focus();
    return true;
  }
}
