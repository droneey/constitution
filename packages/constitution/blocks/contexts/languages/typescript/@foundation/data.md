# Data

> Governs the text TypeScript writes for another program.

## Data written as text

### machine-text-never-formatted-by-intl → machine-text-independent-of-the-locale · MUST

No text written for another program is formatted by a locale-aware call. It uses no `toLocaleString`, `toLocaleUpperCase`, `toLocaleLowerCase`, `localeCompare` or `Intl` call; a number is written by `String` or `toFixed`, an instant by `toString` of a `Temporal` value, or by `toISOString` of a `Date` an API hands over.

| Why |
|---|
| these calls read the locale of the process or the browser, so the same value is written differently on each machine. |
