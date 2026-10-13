# Mobile with a user interface

> Governs screens on a phone or tablet: the system's lifecycle, links, permissions, the keyboard, touch and the system's accessibility settings.

## Screens

### state-survives-the-os-lifecycle · SHOULD
Input and view state survive the system's lifecycle: going to the background, being suspended and being ended by the system lose neither.

| Why | Tags |
|---|---|
| the system ends apps without asking, and a user who comes back expects to find what they left. | [ux, data] |

### content-kept-inside-the-safe-areas · MUST
Content and controls stay inside the screen's safe areas.

| Why | Tags |
|---|---|
| outside them, the notch, the rounded corners and the system bars hide what is there. | [ux] |

### back-gesture-goes-back · SHOULD
The system's back gesture and button go back, and no gesture of the app's own competes with the navigator's.

| Why | Tags |
|---|---|
| back is the gesture users trust most, and one that does something else loses them. | [ux] |

### view-state-held-in-the-navigation-parameters → view-state-kept-in-the-navigation-state · MUST
View state a deep link or a restart must reproduce lives in the navigation parameters of its screen.

| Why | Tags |
|---|---|
| a view whose state is not in its parameters can be neither linked nor restored after the system ends the app. | [data] |

### deep-link-only-opens-a-screen · MUST
A link opens a screen with its parameters and performs no action — a payment, a send, a change of settings — until the user confirms it there.

| Why | Tags |
|---|---|
| anyone can craft a link and get it tapped, so a link that acts at once acts for its author, not for the user. | [security] |

### sensitive-screen-hidden-from-captures · SHOULD
A screen that shows a secret or sensitive personal data blocks screenshots and screen recording where the system allows it, and is covered in the snapshot the app switcher keeps.

| Why | Tags |
|---|---|
| screenshots sync to the cloud and the app switcher shows the last screen to whoever holds the phone, so what was on it outlives the moment it was read. | [security] |

### permission-requested-when-its-feature-is-first-used · SHOULD
A permission is requested when the user first reaches the feature that needs it, after the screen says why, never at start.

| Why | Tags |
|---|---|
| a person grants what they understand at the moment it is needed, and a request at start, out of context, is refused for good. | [ux] |

### refused-permission-leaves-the-app-working · SHOULD
A refused permission leaves every feature that does not need it working, and the feature that needs it says what it lacks and how to grant it in the system's settings.

| Why | Tags |
|---|---|
| a person who refuses one permission still came to use the app, and a feature that fails silently tells them nothing. | [ux] |

## Components

### copied-secret-marked-sensitive · SHOULD
A secret the app copies — a one-time code, a password, a key — is marked sensitive and local to the device, and expires from the clipboard.

| Why | Tags |
|---|---|
| other apps can read the clipboard, a synced clipboard reaches the user's other devices, and the system shows what was copied unless it is marked sensitive. | [security] |

## Forms

### focused-field-kept-above-the-keyboard · SHOULD
The focused field and its action stay above the on-screen keyboard.

| Why | Tags |
|---|---|
| a user who cannot see what they type, or the button that sends it, is stuck. | [ux] |

### sensitive-field-kept-from-keyboard-learning → field-declares-its-kind · MUST
A field that takes a secret is declared a secure entry, and one that takes other sensitive data turns off the keyboard's suggestions and learning; the system's autofill stays on.

| Why | Tags |
|---|---|
| a keyboard learns what is typed and offers it again to whoever types next, and a third-party keyboard may send it away. | [security] |

## Accessibility

### touch-target-44-pt-on-ios-48-dp-on-android → target-meets-the-minimum-size · MUST
A touch target is at least 44 × 44 points on iOS and 48 × 48 density-independent pixels on Android, padding included.

| Why | Tags |
|---|---|
| these are the sizes a finger hits reliably, as each system's guidelines set them. | [a11y] |

### control-declares-label-role-and-state → every-control-has-an-accessible-name · MUST
Every interactive element declares its accessible label, role and state through the system's accessibility properties.

| Why | Tags |
|---|---|
| the system's screen reader reads only what these properties declare. | [a11y] |

### screen-reader-order-follows-the-layout → focus-order-follows-the-visual-order · MUST
The screen reader's order follows the visual order.

| Why | Tags |
|---|---|
| a reading order that jumps around the screen cannot be followed. | [a11y] |

### text-follows-the-systems-text-size → wcag-aa-conformance · MUST
Text follows the system's text size, up to its largest accessibility size, and layouts reflow so nothing is clipped or overlaps.

| Why | Tags |
|---|---|
| people who set a larger text size need it in every app, not only in the system's own. | [a11y] |

### reduced-motion-read-from-the-system → reduced-motion-honoured · MUST
The request for reduced motion is the system's setting — Reduce Motion on iOS, Remove animations on Android — read when the app starts and again when it changes.

| Why | Tags |
|---|---|
| the setting is the user's request, made once for every app. | [a11y] |

### orientations-declared-in-the-manifest → orientation-never-locked · MUST
The app's manifest — `Info.plist` on iOS, `AndroidManifest.xml` on Android — declares portrait and landscape; a screen whose one orientation is essential locks it in its own code.

| Why | Tags |
|---|---|
| an orientation locked in the manifest turns every screen away from a person whose device is mounted the other way. | [a11y] |

## Tests

### component-operated-with-each-systems-screen-reader → interactive-checked-by-hand · SHOULD
Before a new interactive component ships, a person operates it with VoiceOver on iOS and TalkBack on Android, and with Switch Control or Switch Access.

| Why | Tags |
|---|---|
| each system's screen reader behaves differently, and a scan catches none of it. | [a11y, testing] |
