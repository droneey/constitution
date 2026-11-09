# Presentation

> Governs how an interactive component of an app on a phone or tablet is checked by hand before it ships.

## Accessibility

### component-operated-with-each-systems-screen-reader → interactive-checked-by-hand · SHOULD

Every new interactive component is operated with the screen reader and the switch access of each system the app runs on.

#### Why

Each system's screen reader and switch access behave differently, and a scan, or a check on one system alone, catches none of it.

#### Examples

```text title="Avoid"
Quantity stepper, checked by hand:
- iOS VoiceOver: reads "Quantity, 2, adjustable"; swiping up adds one
```

```text title="Prefer"
Quantity stepper, checked by hand:
- iOS VoiceOver: reads "Quantity, 2, adjustable"; swiping up and down changes it
- iOS Switch Control: scanning reaches it; increment and decrement each act once
- Android TalkBack: reads "Quantity, 2"; its actions add and remove one
- Android Switch Access: scanning reaches both buttons; each acts once
```
