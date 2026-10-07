# Formats

> Governs a value shown in the reader’s locale and zone.

## Values

### values-formatted-by-the-active-locale · MUST
Numbers, dates, times, amounts and lists are formatted by the active locale, which every formatter is given; none is left to the runtime's locale.

| Why | Tags |
|---|---|
| `1,000.50` and `1.000,50` are one number to different readers, and the runtime's locale differs between the server, the client and a spec. | [ux] |

### instant-shown-in-the-readers-zone → instant-carries-its-zone · MUST
An instant is shown in the reader's time zone, with the zone named where a reader could take it for another; an instant bound to a place — a departure, an opening hour — is shown in that place's zone, and names it.

| Why | Tags |
|---|---|
| an instant shown in the server's zone names a different hour to every reader elsewhere. | [] |

### currency-from-the-amount · MUST
An amount is shown in its own currency, which travels with the amount; the locale changes only how it is written.

| Why | Tags |
|---|---|
| a price formatted in the reader's currency shows €10 as $10, a different sum of money. | [data, ux] |

### text-sorted-by-the-locale · SHOULD
Text a person reads in order — names, options, titles — is sorted by the active locale's collation, never by code point.

| Why | Tags |
|---|---|
| sorting by code point puts `Ä` after `Z` and `é` after `z`, where no reader looks for them. | [ux] |
