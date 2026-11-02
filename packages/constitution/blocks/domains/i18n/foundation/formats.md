# Formats

> Governs a value shown in the reader’s locale and zone.

## Values

### values-formatted-by-the-active-locale · MUST

Values are formatted by the active locale. That holds for numbers, dates, times, amounts and lists, and every formatter is given that locale; none is left to the runtime's locale.

| Why |
|---|
| `1,000.50` and `1.000,50` are one number to different readers, and the runtime's locale differs between the server, the client and a spec. |

### entered-value-parsed-by-the-active-locale · SHOULD

A value its user types is parsed by the active locale. That holds for a number, a date or an amount, by the same rules that format it.

| Why |
|---|
| a user in a locale that writes `1,5` otherwise enters fifteen, or nothing, where they meant one and a half. |

### instant-shown-in-the-readers-zone → instant-is-an-exact-time · MUST

An instant is shown in the reader's time zone. The zone is named where a reader could take it for another, and a time bound to a place — a departure, an opening hour — is shown in that place's zone, and names it.

| Why |
|---|
| an instant shown in the server's zone names a different hour to every reader elsewhere. |

### currency-from-the-amount · MUST

An amount is shown in its own currency. The currency travels with the amount, and the locale changes only how it is written.

| Why |
|---|
| a price formatted in the reader's currency shows €10 as $10, a different sum of money. |

### text-sorted-by-the-locale · SHOULD

Text a person reads in order is sorted by the active locale's collation. Such text — names, options, titles — is never sorted by code point.

| Why |
|---|
| sorting by code point puts `Ä` after `Z` and `é` after `z`, where no reader looks for them. |
