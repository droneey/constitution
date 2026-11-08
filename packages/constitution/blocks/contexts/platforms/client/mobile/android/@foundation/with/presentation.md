# Presentation

> Governs the screens of an Android app: the declaration of its right-to-left support and the check of its accessibility.

## Direction

### right-to-left-support-declared-to-the-system → layout-mirrors-right-to-left · MUST

Wherever the app offers a language written right to left, its app manifest sets `android:supportsRtl` to `true`.

| Why |
|---|
| Android mirrors an app's layout only where its app manifest sets `android:supportsRtl` to `true`, which is `false` by default, so an app that leaves it unset shows every screen backwards to a right-to-left reader, however its screens place what they hold. |

## Accessibility

### state-checked-by-the-accessibility-test-framework → rendered-state-scanned-for-accessibility-once · MUST

Every state of an Android app's screens is checked by Google's Accessibility Test Framework in a UI test. A view is checked through Espresso's `AccessibilityChecks`, run from the root view, and Jetpack Compose through the test rule's `enableAccessibilityChecks()`.

| Why |
|---|
| a state no check reaches ships the label, contrast and touch-target issues a tool would have caught, and Espresso checks by default only the view an action touches and its descendants, so a check not run from the root view passes over the rest of the screen. |
