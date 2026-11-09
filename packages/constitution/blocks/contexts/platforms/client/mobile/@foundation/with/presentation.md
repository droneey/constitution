# Presentation

> Governs how the screens of an app on a phone or tablet meet presentation's rules: the app's felt speed, the system's accessibility, text size, motion, orientation and contrast settings, and the direction of the layout.

## Vocabulary

An **app manifest** is the file the system reads an app's capabilities from.

## Speed

### app-vitals-within-the-app-stores-thresholds → felt-speed-measured-in-the-field-within-budget · SHOULD

Every vital of the app stays within the project's budget, and below its app store's threshold where it sets a stricter one. The vitals are its cold start, its slow and frozen frames and its rate of the system's not-responding reports.

#### Why

They measure what people feel of an app (the wait to open it, the stutter, the frozen answer to a tap) and an app store that publishes such thresholds shows an app that crosses them to fewer people.

#### Examples

```yaml title="Avoid"
# budgets/app-vitals.yaml
coldStartP90Ms: 4000
userPerceivedAnrRatePercent: 1.0   # above Google Play's 0.47% threshold
```

```yaml title="Prefer"
# budgets/app-vitals.yaml
coldStartP90Ms: 1500
slowFramesPercent: 5
frozenFramesPercent: 0.1
userPerceivedAnrRatePercent: 0.2
googlePlayAnrThresholdPercent: 0.47
```

## Accessibility

### added-role-set-in-the-systems-accessibility-properties → wcag-aa-conformance · MUST

Every role and state the app adds to a control is set in the system's accessibility properties. Neither is shown only in the control's look or worded only into its label.

#### Why

The system's screen reader and switch access read a role or a state only from these properties, so one shown only in the look or worded into the label is lost or misread — WCAG 2.2, Name, Role, Value.

#### Examples

```swift title="Avoid"
Button { select(.express) } label: {
    Text("Express").padding()
}
.background(isSelected ? Color.accentColor : .clear)
.accessibilityLabel(isSelected ? "Express, selected" : "Express")   // the state worded into the label
```

```swift title="Prefer"
Button { select(.express) } label: {
    Text("Express").padding()
}
.background(isSelected ? Color.accentColor : .clear)
.accessibilityAddTraits(isSelected ? .isSelected : [])
```

### text-follows-the-systems-text-size → wcag-aa-conformance · MUST

All text follows the system's text size up to its largest accessibility size, shown whole at each, never clipped or overlapped. Exempt: text cut to fit whose whole text can be reached.

#### Why

A person who set a larger text size cannot read an app that ignores it, nor text its layout clips — WCAG 2.2, Resize Text.

#### Examples

```swift title="Avoid"
Text(order.title)
    .font(.system(size: 15))   // stays 15 points at every text size
    .frame(height: 20)
```

```swift title="Prefer"
Text(order.title)
    .font(.body)
```

### reduced-motion-read-from-the-system → reduced-motion-honoured · MUST

Every app reads the request for reduced motion from the system's setting, when it starts and again whenever the setting changes.

#### Why

The user makes the request once, in the system, for every app, so an app that reads it elsewhere, or only at its start, moves when it was asked not to.

#### Examples

```swift title="Avoid"
struct CartBadge: View {
    @AppStorage("reduceMotion") private var reducesMotion = false   // the app's own switch, not the system's
    let count: Int

    var body: some View {
        Text(count, format: .number)
            .contentTransition(.numericText())
            .animation(reducesMotion ? nil : .snappy, value: count)
    }
}
```

```swift title="Prefer"
struct CartBadge: View {
    @Environment(\.accessibilityReduceMotion) private var reducesMotion
    let count: Int

    var body: some View {
        Text(count, format: .number)
            .contentTransition(.numericText())
            .animation(reducesMotion ? nil : .snappy, value: count)
    }
}
```

### orientations-declared-in-the-manifest → orientation-never-locked · MUST

Every app manifest declares both portrait and landscape for its app.

#### Why

An orientation locked for the whole app in its app manifest turns every screen away from a person whose device is mounted the other way — WCAG 2.2, Orientation.

#### Examples

```xml title="Avoid"
<!-- Info.plist -->
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string> <!-- locks every screen upright -->
</array>
```

```xml title="Prefer"
<!-- Info.plist -->
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
</array>
```

## Modes

### increased-contrast-mode-follows-the-systems-contrast-setting → theme-follows-system-until-chosen · MUST

Wherever an app's theme has an increased-contrast mode, that mode follows the system's contrast setting until its user chooses one. The app reads the setting when it starts and again whenever it changes.

#### Why

A person with low vision asks every app for more contrast once, in the system, and an app whose increased-contrast mode ignores the request is one they cannot read.

#### Examples

```swift title="Avoid"
struct OrdersScreen: View {
    @AppStorage("increasedContrast") private var isIncreasedContrast = false   // ignores the system's setting

    var body: some View {
        OrderList().environment(\.theme, Theme(isIncreasedContrast: isIncreasedContrast))
    }
}
```

```swift title="Prefer"
struct OrdersScreen: View {
    @Environment(\.colorSchemeContrast) private var systemContrast
    @AppStorage("contrastChoice") private var contrastChoice = ContrastChoice.system

    var body: some View {
        OrderList().environment(\.theme, Theme(isIncreasedContrast: isIncreasedContrast))
    }

    private var isIncreasedContrast: Bool {
        switch contrastChoice {
        case .system: systemContrast == .increased
        case .standard: false
        case .increased: true
        }
    }
}
```

## Direction

### layout-placed-by-leading-or-trailing-side → layout-mirrors-right-to-left · MUST

Wherever the app offers a language written right to left, every screen places what it holds by its leading and trailing sides. None of it is placed by left and right. Exempt: numbers, media controls and logos, which keep their direction.

#### Why

What a screen places by left and right stays where it is when the system mirrors the app, so in a right-to-left locale it sits on the wrong side, against the reading direction.

#### Examples

```xml title="Avoid"
<!-- app/src/main/res/layout/order_row.xml -->
<TextView
    android:id="@+id/order_total"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_alignParentRight="true"
    android:layout_marginLeft="16dp" /> <!-- stays on the right in Arabic -->
```

```xml title="Prefer"
<!-- app/src/main/res/layout/order_row.xml -->
<TextView
    android:id="@+id/order_total"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_alignParentEnd="true"
    android:layout_marginStart="16dp" />
```
