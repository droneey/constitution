# User interface

> Governs screens on a phone or tablet: the system's lifecycle, its safe areas and back gesture, the view state its navigation parameters hold, what it hides from captures and the clipboard, speed, the keyboard, touch and the system's accessibility settings.

## Screens

### state-survives-the-os-lifecycle · SHOULD

Input and view state survive the system's lifecycle. Going to the background, being suspended and being ended by the system lose neither.

| Why |
|---|
| the system ends apps without asking, and a user who comes back to find what they left gone has lost their work. |

### content-kept-inside-the-safe-areas · MUST

Content and controls stay inside the screen's safe areas.

| Why |
|---|
| outside them, the notch, the rounded corners and the system bars hide what is there. |

### back-gesture-goes-back · SHOULD

The system's back gesture and button go back. No gesture of the app's own competes with the navigator's.

| Why |
|---|
| back is the gesture users trust most, and one that does something else loses them. |

### view-state-held-in-the-navigation-parameters → view-state-kept-in-the-navigation-state · MUST

View state a deep link or a restart must reproduce lives in the navigation parameters of its screen.

| Why |
|---|
| a view whose state is not in its parameters can be neither linked nor restored after the system ends the app. |

### sensitive-screen-hidden-from-captures · SHOULD

A sensitive screen is hidden from captures. A screen is sensitive when it shows a secret or sensitive personal data; it blocks screenshots and screen recording where the system allows it, and is covered in the snapshot the app switcher keeps.

| Why |
|---|
| screenshots sync to the cloud and the app switcher shows the last screen to whoever holds the phone, so what was on it outlives the moment it was read. |

### app-vitals-within-budget → felt-speed-measured-in-the-field-within-budget · SHOULD

The app's vitals stay within their budgets, never past the stores' thresholds of bad behaviour. The budgets cover the app's cold start, slow and frozen frames, crash rate and rate of the system's not-responding reports.

| Why |
|---|
| they measure what people feel of an app (the wait to open it, the stutter, the crash) and a store that sees them cross its thresholds shows the app to fewer people. |

## Components

### copied-secret-marked-sensitive · SHOULD

A copied secret is marked sensitive and local to the device, and expires from the clipboard. This holds for each secret the app copies — a one-time code, a password, a key.

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

A sensitive field is kept from the keyboard's learning. A field that takes a secret is declared a secure entry, and one that takes other sensitive data turns off the keyboard's suggestions and learning; the system's autofill stays on.

| Why |
|---|
| a keyboard learns what is typed and offers it again to whoever types next, and a third-party keyboard may send it away. |

## Accessibility

### touch-target-44-pt-on-ios-48-dp-on-android → target-meets-the-minimum-size · MUST

A touch target is at least 44 × 44 points on iOS and 48 × 48 density-independent pixels on Android, padding included.

| Why |
|---|
| a finger misses a target smaller than the size each system's guidelines set as the one it hits reliably — WCAG 2.2, Target Size (Enhanced). |

### control-declares-label-role-and-state → every-control-has-an-accessible-name · MUST

Every interactive element declares its accessible label, role and state through the system's accessibility properties.

| Why |
|---|
| the system's screen reader reads only what these properties declare, so a control that declares none is silent or misnamed to its user — WCAG 2.2, Name, Role, Value. |

### text-follows-the-systems-text-size → wcag-aa-conformance · MUST

Text follows the system's text size, up to its largest accessibility size. Layouts reflow so nothing is clipped or overlaps.

| Why |
|---|
| a person who set a larger text size cannot read an app that ignores it, nor text its layout clips — WCAG 2.2, Resize Text. |

### reduced-motion-read-from-the-system → reduced-motion-honoured · MUST

The request for reduced motion is read from the system's setting. The setting is Reduce Motion on iOS and Remove animations on Android, read when the app starts and again when it changes.

| Why |
|---|
| the user makes the request once, in the system, for every app, so an app that reads it elsewhere, or only at its start, moves when it was asked not to. |

### orientations-declared-in-the-manifest → orientation-never-locked · MUST

The app's manifest declares both portrait and landscape. The manifest is `Info.plist` on iOS and `AndroidManifest.xml` on Android; a screen whose one orientation is essential locks it in its own code.

| Why |
|---|
| an orientation locked in the manifest turns every screen away from a person whose device is mounted the other way — WCAG 2.2, Orientation. |

### component-operated-with-each-systems-screen-reader → interactive-checked-by-hand · SHOULD

A new interactive component is operated with each system's screen reader and switch access before it ships. A person operates it with VoiceOver on iOS and TalkBack on Android, and with Switch Control or Switch Access.

| Why |
|---|
| each system's screen reader behaves differently, and a scan catches none of it. |
