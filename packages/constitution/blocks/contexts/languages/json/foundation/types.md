# Types

> Governs the values a JSON document carries to another program: its instants, its amounts of money and its large integers.

## Values another program reads

### time-sent-in-the-standard-form-of-its-kind → instant-is-an-exact-time · MUST

In JSON another program reads, a time takes the standard form of its kind. Such JSON is an API's answer, a message or a stored record; an instant in UTC is a `date-time` that ends in `Z`, a date without a time is a `full-date`, a duration an ISO 8601 duration, and a time a person set in a place is RFC 9557's local `date-time` with its IANA zone in brackets, `2026-10-15T10:00:00+03:00[Europe/Kyiv]`, or a local `date-time` and a separate zone field its schema declares, never an instant alone.

| Why |
|---|
| one instant spelled `+00:00` by one writer and `Z` by another compares unequal as text, a date sent as a `date-time` at midnight falls on the day before in a zone west of it, a duration sent as a number hides its unit, and a time a person set, sent as an instant alone, moves when its zone's rules change — RFC 3339 and ISO 8601. |

### money-sent-as-a-decimal-and-its-currency → exact-quantity-never-binary-float · MUST

In JSON another program reads, an amount of money is a decimal and its currency. It is an object of a decimal string, or an integer of minor units, and an ISO 4217 currency code, never a JSON number with a fraction.

| Why |
|---|
| most JSON parsers read a number as a binary float, so `0.1` arrives as something else, and an amount sent without its currency is read in whatever currency its reader assumes — ISO 4217. |

### large-integer-sent-as-a-string · SHOULD

In JSON another program reads, an integer that can exceed 2^53 − 1 is a string. Such integers include a 64-bit identifier and a count of bytes.

| Why |
|---|
| many parsers read a JSON number as a double and round a larger integer in silence. |
