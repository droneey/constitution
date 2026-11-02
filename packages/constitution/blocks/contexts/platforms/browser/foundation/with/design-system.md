# Design system

> Governs how the theme's modes follow the person's settings in a browser.

## Modes

### increased-contrast-mode-follows-prefers-contrast → theme-follows-system-until-chosen · MUST

The theme's increased-contrast mode follows `prefers-contrast: more` until the user chooses one in the program. The query is read before the first paint and again when it changes.

| Why |
|---|
| a person with low vision asks every site for more contrast once, in their settings, and a page that ignores the request is one they cannot read. |
