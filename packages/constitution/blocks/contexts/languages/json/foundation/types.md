# Types

> Governs the values a JSON document carries to another program: its instants, its amounts of money and its large integers.

## Values another program reads

### instant-sent-as-rfc-3339 → instant-is-an-exact-time · MUST

In JSON another program reads — an API's answer, a message, a stored record — an instant is an RFC 3339 `date-time` with its offset, `Z` for UTC; a date without a time is a `full-date`, a duration an ISO 8601 duration, and a time a person set in a place is RFC 9557's local `date-time` with its IANA zone in brackets, `2026-10-15T10:00:00+03:00[Europe/Kyiv]`, or a local `date-time` and a separate zone field its schema declares, never an instant alone.

| Why |
|---|
| a number of seconds hides its unit, and a local time without an offset is read in the reader's zone. |

### money-sent-as-a-decimal-and-its-currency → exact-quantity-never-binary-float · MUST

In JSON another program reads, an amount of money is an object of a decimal string, or an integer of minor units, and an ISO 4217 currency code, never a JSON number with a fraction.

| Why |
|---|
| most JSON parsers read a number as a binary float, so `0.1` arrives as something else. |

### large-integer-sent-as-a-string · SHOULD

In JSON another program reads, an integer that can exceed 2^53 − 1 — a 64-bit identifier, a count of bytes — is a string.

| Why |
|---|
| many parsers read a JSON number as a double and round a larger integer in silence. |
