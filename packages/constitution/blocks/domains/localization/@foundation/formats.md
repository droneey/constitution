# Formats

> Governs a value shown in the reader's locale and zone.

## Values

### values-formatted-by-the-active-locale · MUST

Every number, date, time, amount and list the program shows a person is formatted by the active locale. Each formatter is handed that locale, never left to the runtime's.

| Why |
|---|
| `1,000.50` and `1.000,50` are one number to different readers, and the runtime's locale differs between the server, the user's device and a spec. |

### entered-value-parsed-by-the-active-locale · MUST

Every number, date or amount a person types is parsed by the active locale, by the same rules that format it.

| Why |
|---|
| a user in a locale that writes `1,5` otherwise enters fifteen, or nothing, where they meant one and a half. |

### currency-from-the-amount · MUST

Every amount is shown in its own currency, the locale changing only how it is written.

| Why |
|---|
| a price formatted in the reader's currency shows €10 as $10, a different sum of money. |

### text-sorted-by-the-locale · SHOULD

Every list of text the program shows a person in order is sorted by the active locale's collation, never by code point. Such text includes names, options and titles.

| Why |
|---|
| sorting by code point puts `Ä` after `Z` and `é` after `z`, where no reader looks for them. |

## Times

### instant-shown-in-the-readers-zone → time-never-read-in-the-machines-zone · MUST

Every instant the program shows a person is shown in that reader's time zone. Where that zone is unknown, it is shown in UTC, named as such. Exempt: a time a person sets in a place, which `place-bound-time-shown-in-its-places-zone` governs.

| Why |
|---|
| an instant shown in the server's zone names a different hour to every reader elsewhere, and one shown in a guessed zone, or in UTC without its name, is read as an hour that never was. |

### place-bound-time-shown-in-its-places-zone · MUST

Every time a person sets in a place is shown in that place's zone. It names that zone wherever it is not its reader's. Such times include a departure and an opening hour.

| Why |
|---|
| a departure shown in the reader's zone gives the hour at home, not at the gate, and the traveller misses it, while one shown without its zone to a reader elsewhere is read in the reader's own. |
