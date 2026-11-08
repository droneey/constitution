# Accessibility

> Governs the checks a person makes of the interface before it ships.

## Checks by hand

### interactive-checked-by-hand · SHOULD

Every new interactive component is checked by hand before it ships. A person operates it with the keyboard or a switch, and with a screen reader: focus reaches it in visual order, the platform's activation input activates it, its dismissal input closes what it opened, and focus returns to what opened it, as Tab, Enter or Space, and Escape do on a keyboard.

| Why |
|---|
| tools see about half of the problems, so a component shipped on their word alone brings the other half to its users. |
