# Screens

> Governs the screens of an app on a phone or tablet as the system shapes them: the system's lifecycle, its back gesture and the parts of the screen it lays over the app.

## Lifecycle

### state-survives-the-os-lifecycle · MUST

Every piece of input and view state survives the system's lifecycle. Going to the background, being suspended and being ended by the system lose none of it. Exempt: a secret typed into a field.

| Why |
|---|
| the system ends apps without asking, and a user who comes back to find what they left gone has lost their work. |

## Navigation

### back-gesture-goes-back · SHOULD

Every use of the system's back gesture or back button goes back, and no gesture of the app's own competes with it.

| Why |
|---|
| back is the gesture users trust most, and one that does something else loses them. |

## System overlays

### content-kept-inside-the-safe-areas · MUST

No text or control, the content a person reads or operates, sits outside the screen's safe areas.

| Why |
|---|
| outside them, the notch, the rounded corners and the system bars hide what is there. |

### focused-field-kept-above-the-keyboard · MUST

While the on-screen keyboard is shown, every focused field and its action stay above it.

| Why |
|---|
| a user who cannot see what they type, or the button that sends it, is stuck. |
