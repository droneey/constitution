# Localization

> Governs the document of a program written for several locales.

## Locale

### document-root-language-follows-the-active-locale · MUST

Every document's root `lang` follows the active locale, a change of locale made without a reload included.

| Why |
|---|
| assistive technology pronounces the text by the declared language, so a stale `lang` reads the new locale with the old one's rules. |

### document-root-direction-follows-the-active-locale · MUST

Every document's root `dir` follows the active locale's direction, a change of locale made without a reload included.

| Why |
|---|
| the browser lays out the page by the declared direction, so a stale `dir` draws a right-to-left locale backwards. |
