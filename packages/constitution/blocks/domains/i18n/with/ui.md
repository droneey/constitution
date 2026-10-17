# Internationalisation with a user interface

> Governs the locale on a screen, its direction and its capitals.

## Screens

### layout-mirrors-right-to-left · MUST

In a locale written right to left, a screen's layout mirrors — what starts on the left starts on the right, and an icon that points along the reading direction turns — while numbers, media controls and logos keep their direction.

| Why | Tags |
|---|---|
| a layout that runs against the reading direction makes a right-to-left reader read every screen backwards. | [ux, a11y] |

### language-offered-in-its-own-name · SHOULD

A language is offered in its own name and script — "Українська", "Deutsch" — never by a flag.

| Why | Tags |
|---|---|
| a reader finds their language by its name, and a flag names a country, which many languages share and many countries split. | [ux] |

### display-capitals-set-by-style · SHOULD

Text a screen shows in capitals takes them from its style, never from its message.

| Why | Tags |
|---|---|
| capitals typed into a message reach every screen and every language that shows it, while a style sets them only where the design wants them, by each language's own rules. | [ux] |
