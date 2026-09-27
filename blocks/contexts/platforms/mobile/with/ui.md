# Mobile with user interface

> Screens on a phone or tablet: touch, safe areas, the keyboard and the system's gestures.

## touch-targets-44-pt-48-dp · MUST
A touch target is at least 44 × 44 points, or 48 × 48 density-independent pixels, padding included.
**Why:** these are the sizes a finger hits reliably, as each system's guidelines set them.
**Check:** review
**Tags:** a11y, ux
**Implements:** `targets-meet-platform-minimum`

## safe-areas-respected · MUST
Content and controls stay inside the safe areas of the screen.
**Why:** outside them, the notch, the rounded corners and the system bars hide what is there.
**Check:** review
**Tags:** ux

## keyboard-never-hides-the-field · SHOULD
The focused field and its action stay above the on-screen keyboard.
**Why:** a user who cannot see what they type, or the button to send it, is stuck.
**Check:** review
**Tags:** ux

## system-back-honoured · SHOULD
The system's back gesture goes back, and the app's own gestures never fight the navigator's.
**Why:** back is the gesture users trust most; one that does something else loses them.
**Check:** review
**Tags:** ux
