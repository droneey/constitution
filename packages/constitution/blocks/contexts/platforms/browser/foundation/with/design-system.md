# Design system

> Governs how the theme's modes follow the person's settings in a browser.

## Modes

### increased-contrast-mode-follows-prefers-contrast → theme-follows-system-until-chosen · MUST

Until the user chooses one in the program, the theme's increased-contrast mode follows `prefers-contrast: more`, read before the first paint and again when the query changes.

| Why |
|---|
| the setting is the person's request, made once for every site, and the contrast it asks for is what lets a person with low vision read the screen. |
