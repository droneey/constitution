# Presentation

> Governs how the screens of an app on a phone or tablet meet presentation's rules: the app's felt speed, the system's accessibility, text size, motion, orientation and contrast settings, and the direction of the layout.

## Vocabulary

An **app manifest** is the file the system reads an app's capabilities from.

## Speed

### app-vitals-within-the-app-stores-thresholds → felt-speed-measured-in-the-field-within-budget · SHOULD

Every vital of the app stays within the project's budget, and below its app store's threshold where it sets a stricter one. The vitals are its cold start, its slow and frozen frames and its rate of the system's not-responding reports.

| Why |
|---|
| they measure what people feel of an app (the wait to open it, the stutter, the frozen answer to a tap) and an app store that publishes such thresholds shows an app that crosses them to fewer people. |

## Accessibility

### added-role-set-in-the-systems-accessibility-properties → wcag-aa-conformance · MUST

Every role and state the app adds to a control is set in the system's accessibility properties. Neither is shown only in the control's look or worded only into its label.

| Why |
|---|
| the system's screen reader and switch access read a role or a state only from these properties, so one shown only in the look or worded into the label is lost or misread — WCAG 2.2, Name, Role, Value. |

### text-follows-the-systems-text-size → wcag-aa-conformance · MUST

All text follows the system's text size up to its largest accessibility size, shown whole at each, never clipped or overlapped. Exempt: text cut to fit whose whole text can be reached.

| Why |
|---|
| a person who set a larger text size cannot read an app that ignores it, nor text its layout clips — WCAG 2.2, Resize Text. |

### reduced-motion-read-from-the-system → reduced-motion-honoured · MUST

Every app reads the request for reduced motion from the system's setting, when it starts and again whenever the setting changes.

| Why |
|---|
| the user makes the request once, in the system, for every app, so an app that reads it elsewhere, or only at its start, moves when it was asked not to. |

### orientations-declared-in-the-manifest → orientation-never-locked · MUST

Every app manifest declares both portrait and landscape for its app.

| Why |
|---|
| an orientation locked for the whole app in its app manifest turns every screen away from a person whose device is mounted the other way — WCAG 2.2, Orientation. |

## Modes

### increased-contrast-mode-follows-the-systems-contrast-setting → theme-follows-system-until-chosen · MUST

Wherever an app's theme has an increased-contrast mode, that mode follows the system's contrast setting until its user chooses one. The app reads the setting when it starts and again whenever it changes.

| Why |
|---|
| a person with low vision asks every app for more contrast once, in the system, and an app whose increased-contrast mode ignores the request is one they cannot read. |

## Direction

### layout-placed-by-leading-or-trailing-side → layout-mirrors-right-to-left · MUST

Wherever the app offers a language written right to left, every screen places what it holds by its leading and trailing sides. None of it is placed by left and right. Exempt: numbers, media controls and logos, which keep their direction.

| Why |
|---|
| what a screen places by left and right stays where it is when the system mirrors the app, so in a right-to-left locale it sits on the wrong side, against the reading direction. |
