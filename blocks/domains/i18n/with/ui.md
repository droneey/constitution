# Internationalisation with a user interface

> Governs the locale on a screen, its language and its direction.

## Screens

### locale-reachable-without-props → props-drilled-at-most-two-levels · SHOULD
The current locale is reachable anywhere in the presentation without being passed as a prop.

| Why | Tags |
|---|---|
| a locale threaded through every component couples all of them to it. | [] |

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

## Language

### screen-declares-its-language · MUST
A screen declares the language of its content, and a passage in another language declares its own.

| Why | Tags |
|---|---|
| a screen reader reads text in the language it is told, and a page in Ukrainian read with English rules is noise. | [a11y] |
