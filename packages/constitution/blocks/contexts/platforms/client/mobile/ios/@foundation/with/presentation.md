# Presentation

> Governs how the screens of an iOS app are scanned for accessibility.

## Accessibility

### state-audited-by-perform-accessibility-audit → rendered-state-scanned-for-accessibility-once · MUST

Every state of an iOS app's screens is scanned in a UI test by XCTest's `performAccessibilityAudit()`. The audit, called on the `XCUIApplication`, fails the test on any issue it finds.

| Why |
|---|
| a state no audit reaches ships the contrast, label and size issues a tool would have caught, found only by a person who cannot use the screen, and an audit run by hand in Accessibility Inspector is skipped on the change that brings the issue. |
