# Mobile with user interface

> Screens on a phone or tablet: touch, safe areas, the keyboard and the system's gestures.

## touch-targets-44-pt-48-dp → targets-meet-platform-minimum
A touch target is at least 44 × 44 points, or 48 × 48 density-independent pixels, padding included.

| Why | Check | Tags |
|---|---|---|
| these are the sizes a finger hits reliably, as each system's guidelines set them. | review | [] |

## safe-areas-respected · MUST
Content and controls stay inside the safe areas of the screen.

| Why | Check | Tags |
|---|---|---|
| outside them, the notch, the rounded corners and the system bars hide what is there. | review | [ux] |

## keyboard-never-hides-the-field · SHOULD
The focused field and its action stay above the on-screen keyboard.

| Why | Check | Tags |
|---|---|---|
| a user who cannot see what they type, or the button to send it, is stuck. | review | [ux] |

## system-back-honoured · SHOULD
The system's back gesture goes back, and the app's own gestures never fight the navigator's.

| Why | Check | Tags |
|---|---|---|
| back is the gesture users trust most; one that does something else loses them. | review | [ux] |

## Accessibility

## accessibility-properties-on-controls → every-control-has-an-accessible-name
Every interactive element declares its accessible label, role and state through the system's accessibility properties.

| Why | Check | Tags |
|---|---|---|
| the system's screen reader reads only what these properties declare. | review | [] |

## reading-order-follows-layout → operable-by-every-input
The screen reader's order follows the visual order.

| Why | Check | Tags |
|---|---|---|
| a reading order that jumps around the screen makes it impossible to follow. | review | [] |

## text-follows-system-size → wcag-aa-conformance
Text follows the system's text size, and layouts reflow to fit it.

| Why | Check | Tags |
|---|---|---|
| people who set a larger text size need it in every app, not only in the system's own. | review | [] |

## system-display-settings-honoured → reduced-motion-honoured
The system's reduced-motion and increased-contrast settings are honoured.

| Why | Check | Tags |
|---|---|---|
| these settings are the user's request, made once for every app. | test | [] |

## device-checklist-before-shipping → interactive-checked-by-hand
Before a new interactive component ships, a person operates it with each system's screen reader, and with a switch or a keyboard.

| Why | Check | Tags |
|---|---|---|
| each system's screen reader behaves differently, and a scan catches none of it. | review | [] |
