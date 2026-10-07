# Values

> Governs how a value travels in JSON.

## JSON

### instant-sent-as-rfc-3339 → instant-carries-its-zone · MUST
An instant on the wire is an RFC 3339 `date-time` with its offset, `Z` for UTC; a date without a time is a `full-date`, and a duration an ISO 8601 duration.

| Why | Tags |
|---|---|
| a number of seconds hides its unit, and a local time without an offset is read in the reader's zone. | [data] |

### money-sent-as-a-decimal-and-its-currency → exact-quantity-never-binary-float · MUST
An amount of money on the wire is an object of a decimal string, or an integer of minor units, and an ISO 4217 currency code, never a JSON number with a fraction.

| Why | Tags |
|---|---|
| most JSON parsers read a number as a binary float, so `0.1` arrives as something else. | [data] |

### large-integer-sent-as-a-string · SHOULD
An integer that can exceed 2^53 − 1 — a 64-bit identifier, a count of bytes — travels as a string.

| Why | Tags |
|---|---|
| many parsers read a JSON number as a double and round a larger integer in silence. | [data] |

### field-names-in-one-case · SHOULD
The fields of every shape the API exchanges are named in one case across the whole API.

| Why | Tags |
|---|---|
| a caller then guesses no field's spelling, and a generated client keeps one convention. | [] |
