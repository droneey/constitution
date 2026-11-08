# Presentation

> Governs how the screens of an iOS app are scanned for accessibility.

## Accessibility

### state-audited-by-perform-accessibility-audit → rendered-state-scanned-for-accessibility-once · MUST

Every state of an iOS app's screens is scanned in a UI test by XCTest's `performAccessibilityAudit()`. The audit, called on the `XCUIApplication`, fails the test on any issue it finds.

#### Why

A state no audit reaches ships the contrast, label and size issues a tool would have caught, found only by a person who cannot use the screen, and an audit run by hand in Accessibility Inspector is skipped on the change that brings the issue.

#### Examples

```swift title="Avoid"
func test_shouldPassTheAudit_whenPaymentIsDeclined() throws {
    // Arrange
    let app = XCUIApplication()
    app.launchArguments = ["-payment-outcome", "declined"]
    app.launch()

    // Act
    app.buttons["Pay"].tap()

    // Assert
    XCTAssertTrue(app.staticTexts["Payment declined"].exists)   // the declined state is never audited
}
```

```swift title="Prefer"
func test_shouldPassTheAudit_whenPaymentIsDeclined() throws {
    // Arrange
    let app = XCUIApplication()
    app.launchArguments = ["-payment-outcome", "declined"]
    app.launch()

    // Act
    app.buttons["Pay"].tap()

    // Assert
    try app.performAccessibilityAudit()
}
```
