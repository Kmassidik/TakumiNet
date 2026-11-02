# 16 — Physical view: power switch and module slots

Status: landed 2026-11-01.

## Power

`Workspace::powered_off` holds the devices whose switch is off (absence = on).
`set_power(id, on)` flips it; `fwd::deliver` refuses traffic in either
direction:

```
PC1 is powered off          (send_pdu error)
Reply from 192.168.1.11: Destination host unreachable   (Command Prompt)
```

The Physical tab swaps `PowerOnPC/PowerOnServer` for `PowerOffPC/
PowerOffLaptop/PowerOffISRG2`, appends `· powered off` to the caption, and the
button toggles through `POST /api/devices/power?id=&on=0|1`.

## Module slots

Routers and switches have two slots (`Workspace::slot_count`); everything else
has none and rejects the request. Accepted modules and their ports:

| Module | Ports added |
|---|---|
| `HWIC-2T` | `Serial0/3/0`, `Serial0/3/1` |
| `NM-2FE2W` | `FastEthernet0/0`, `FastEthernet0/1` |

- Drag a module card from the tray onto a slot (`dragstart` →
  `dataTransfer text/plain`, slot handles `dragover`/`drop`).
- Click a filled slot to empty it. The server refuses if any of that module's
  ports is cabled: `Serial0/3/0 is cabled; unplug it before removing the module`.
- Inserting the same module twice is a no-op; unknown models, out-of-range
  slots and slot-less devices return errors instead of silently doing nothing.

## Verified

- Unit: `power_off_drops_traffic_until_switched_back_on`,
  `module_slots_add_ports_and_refuse_removal_while_cabled`.
- Persistence: the round-trip test now also asserts the power switch and the
  installed module survive save → load, and the file stays byte-identical.
- Chromium: Router0 → Physical shows `Slot 0: HWIC-2T`, `Slot 1: empty`, the
  `HWIC-2T`/`NM-2FE2W` tray and `Power Off`; dropping `NM-2FE2W` on slot 1
  updated the label and `/api/devices/ports` grew `FastEthernet0/0-1`.
