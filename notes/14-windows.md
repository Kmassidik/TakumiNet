# 14 — Window management

Status: landed 2026-11-01.

## What changed

Every device/console window is now a real window instead of a centred modal:

- **Drag** by the title bar (`makeWindowMovable`): the box switches to
  `position: fixed` on the first move and is clamped so the title stays
  reachable. Works for the device window, Command Prompt, Terminal, Web
  Browser and PDU detail.
- **Maximize** (`□`) toggles `.preview.maxed`, which fills the viewport
  (`inset: 12px`), and restores the previous position when toggled back.
  Minimize (`—`) hides the window without closing the session (closing still
  resets the CLI/telnet session).
- **Z-order**: `bringToFront` raises the overlay on open and on any pointer
  press inside the box, so clicking an older window brings it over a newer one
  instead of being trapped underneath.
- The overlay backdrop is now transparent (`background: transparent`), so two
  open windows are both visible — PT does not dim the workspace behind them.
  The full-screen overlay still catches outside clicks, keeping
  click-outside-to-close.

## Verified in Chromium

```
before drag: {x: 340, y: 217, w: 760}
after drag : {x: 500, y: 307, position: 'fixed'}   delta 160/90
maximize   : .maxed = true, width 1416 (viewport 1440)
stack      : device z=81, cmd z=82  →  reopen: 83 / 84
```

## Consequence for the IP dialog

`#ip-dialog` already used `z-index: 95` so it sits above the device window that
opens it; the transparent backdrop keeps that readable.
