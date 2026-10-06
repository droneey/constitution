# Mobile with user interface

> Screens on a phone or tablet: the system's lifecycle, touch, safe areas, the keyboard and the system's gestures.

## useful-offline-with-what-it-has · SHOULD
Offline, the app opens, shows the data it has cached, marked as such, and says which actions wait. A write made offline is queued, retried or refused, never lost silently.

| Why | Check | Tags |
|---|---|---|
| a phone is offline often; an app that is useless then fails its users every day. | review | [ux, data] |

## state-survives-the-os-lifecycle · SHOULD
Going to the background, being suspended or being ended by the system loses no input and no view state.

| Why | Check | Tags |
|---|---|---|
| the system ends apps without asking, and a user who comes back expects to find what they left. | test | [ux, data] |

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

## system-reduced-motion-honoured → reduced-motion-honoured
The user's request for reduced motion is the system's setting — Reduce Motion on iOS, Remove animations on Android — read when the app starts and again when it changes.

| Why | Check | Tags |
|---|---|---|
| the setting is the user's request, made once for every app. | test | [] |

## system-increased-contrast-honoured · MUST
The app follows the system's contrast setting — Increase Contrast on iOS, High contrast text on Android — with the higher-contrast colours of its theme, read when it starts and again when the setting changes.

| Why | Check | Tags |
|---|---|---|
| the setting is the user's request, made once for every app, and the contrast it asks for is what lets a person with low vision read the screen. | test | [] |

## device-checklist-before-shipping → interactive-checked-by-hand
Before a new interactive component ships, a person operates it with VoiceOver on iOS and TalkBack on Android, and with Switch Control or Switch Access.

| Why | Check | Tags |
|---|---|---|
| each system's screen reader behaves differently, and a scan catches none of it. | review | [] |

## navigation-params-hold-view-state → view-state-homes
View state a deep link or a restart must reproduce lives in the navigation parameters.

| Why | Check | Tags |
|---|---|---|
| a view that is not in its parameters cannot be linked or restored. | review | [data] |
