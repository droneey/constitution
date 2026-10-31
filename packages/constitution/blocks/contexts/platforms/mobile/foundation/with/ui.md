# User interface

> Governs screens on a phone or tablet: the system's lifecycle, its safe areas and back gesture, the view state its navigation parameters hold, what it hides from captures and the clipboard, speed, the keyboard, touch and the system's accessibility settings.

## Screens

### state-survives-the-os-lifecycle · SHOULD

Input and view state survive the system's lifecycle: going to the background, being suspended and being ended by the system lose neither.

| Why |
|---|
| the system ends apps without asking, and a user who comes back expects to find what they left. |

### content-kept-inside-the-safe-areas · MUST

Content and controls stay inside the screen's safe areas.

| Why |
|---|
| outside them, the notch, the rounded corners and the system bars hide what is there. |

### back-gesture-goes-back · SHOULD

The system's back gesture and button go back, and no gesture of the app's own competes with the navigator's.

| Why |
|---|
| back is the gesture users trust most, and one that does something else loses them. |

### view-state-held-in-the-navigation-parameters → view-state-kept-in-the-navigation-state · MUST

View state a deep link or a restart must reproduce lives in the navigation parameters of its screen.

| Why |
|---|
| a view whose state is not in its parameters can be neither linked nor restored after the system ends the app. |

### sensitive-screen-hidden-from-captures · SHOULD

A screen that shows a secret or sensitive personal data blocks screenshots and screen recording where the system allows it, and is covered in the snapshot the app switcher keeps.

| Why |
|---|
| screenshots sync to the cloud and the app switcher shows the last screen to whoever holds the phone, so what was on it outlives the moment it was read. |

### app-vitals-within-budget → felt-speed-measured-in-the-field-within-budget · SHOULD

The budgets cover the app's cold start, slow and frozen frames, crash rate and rate of the system's not-responding reports, and never pass the thresholds of bad behaviour the stores set.

| Why |
|---|
| they measure what people feel of an app — the wait to open it, the stutter, the crash — and a store that sees them cross its thresholds shows the app to fewer people. |

## Components

### copied-secret-marked-sensitive · SHOULD

A secret the app copies — a one-time code, a password, a key — is marked sensitive and local to the device, and expires from the clipboard.

| Why |
|---|
| other apps can read the clipboard, a synced clipboard reaches the user's other devices, and the system shows what was copied unless it is marked sensitive. |

## Forms

### focused-field-kept-above-the-keyboard · SHOULD

The focused field and its action stay above the on-screen keyboard.

| Why |
|---|
| a user who cannot see what they type, or the button that sends it, is stuck. |

### sensitive-field-kept-from-keyboard-learning → field-declares-its-kind · MUST

A field that takes a secret is declared a secure entry, and one that takes other sensitive data turns off the keyboard's suggestions and learning; the system's autofill stays on.

| Why |
|---|
| a keyboard learns what is typed and offers it again to whoever types next, and a third-party keyboard may send it away. |

## Accessibility

### touch-target-44-pt-on-ios-48-dp-on-android → target-meets-the-minimum-size · MUST

A touch target is at least 44 × 44 points on iOS and 48 × 48 density-independent pixels on Android, padding included.

| Why |
|---|
| these are the sizes a finger hits reliably, as each system's guidelines set them. |

### control-declares-label-role-and-state → every-control-has-an-accessible-name · MUST

Every interactive element declares its accessible label, role and state through the system's accessibility properties.

| Why |
|---|
| the system's screen reader reads only what these properties declare. |

### text-follows-the-systems-text-size → wcag-aa-conformance · MUST

Text follows the system's text size, up to its largest accessibility size, and layouts reflow so nothing is clipped or overlaps.

| Why |
|---|
| people who set a larger text size need it in every app, not only in the system's own. |

### reduced-motion-read-from-the-system → reduced-motion-honoured · MUST

The request for reduced motion is the system's setting — Reduce Motion on iOS, Remove animations on Android — read when the app starts and again when it changes.

| Why |
|---|
| the setting is the user's request, made once for every app. |

### orientations-declared-in-the-manifest → orientation-never-locked · MUST

The app's manifest — `Info.plist` on iOS, `AndroidManifest.xml` on Android — declares portrait and landscape; a screen whose one orientation is essential locks it in its own code.

| Why |
|---|
| an orientation locked in the manifest turns every screen away from a person whose device is mounted the other way. |
