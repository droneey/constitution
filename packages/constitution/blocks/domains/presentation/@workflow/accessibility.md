# Accessibility

> Governs the checks a person makes of the interface before it ships.

## Checks by hand

### interactive-checked-by-hand · SHOULD

Every new interactive component is checked by hand before it ships. A person operates it with the keyboard or a switch, and with a screen reader: focus reaches it in visual order, the platform's activation input activates it, its dismissal input closes what it opened, and focus returns to what opened it, as Tab, Enter or Space, and Escape do on a keyboard.

#### Why

Tools see about half of the problems, so a component shipped on their word alone brings the other half to its users.

#### Examples

```text title="Avoid"
#212 Add a delivery date picker
  lint            pass
  tests           pass
  accessibility   scan pass
  merged
```

```text title="Prefer"
#212 Add a delivery date picker
  lint            pass
  tests           pass
  accessibility   scan pass
  by hand, keyboard and screen reader:
    [x] Tab reaches it after "Name"
    [x] Enter opens the calendar
    [x] arrows move the day, Enter picks it
    [x] Escape closes, focus back on it
    [x] read as "Delivery date, button"
```
