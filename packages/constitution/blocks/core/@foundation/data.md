# Data

> Governs data the program exchanges with others or keeps beyond a run: its parse where it enters and data written as text.

## Vocabulary

A value is **from outside** when a party outside the program controls it, or when the program itself wrote it in an earlier run or version, such as text, a response, a file, a message, a stored record or another program's output, a language model's or a sensor's.

A shape another party **owns** is one that party may extend.

A **strict** parse fails on an unknown key, a value of another type or a value outside an enumeration; a **tolerant** parse checks the fields it reads and ignores the rest.

**Machine text** is text written for another program, or for a later run of the program that wrote it, such as an API's answer, a message, a file or a stored record.

A spec is what the tests chapter defines.

A wall time and an exact quantity are what the types chapter defines.

## Parse where it enters

### outside-value-untyped-until-parsed · MUST

Every value from outside is parsed before code relies on its type. A schema parses it or plain checks narrow it, in specs as in production, as the types chapter's narrowing asks.

| Why |
|---|
| a type written over unparsed data is a promise the data never made, and the first unexpected field breaks code far away — parse, don't validate. |

### outside-value-parsed-once-where-it-enters · MUST

Every value from outside is parsed once, where it enters, and trusted after.

| Why |
|---|
| a value parsed again wherever it is used is parsed differently in each place, and one parsed deep inside the code has travelled unchecked through everything before it. |

### own-shape-parsed-strictly · MUST

Every shape the program owns is parsed strictly. Exempt: a shape that another version of the program also writes, such as a stored record or a message between its instances, which is parsed tolerantly.

| Why |
|---|
| a loose parse of the program's own shape lets in what the program does not know, and the mistake surfaces far from where it entered, while a strict parse of a shape two versions write breaks the older one, during a deploy or a rollback, on the first field the newer adds. |

### other-partys-shape-parsed-tolerantly · MUST

Every shape another party owns is parsed tolerantly.

| Why |
|---|
| a strict parse of another party's shape breaks on the first field that party adds, though nothing the program reads changed — a tolerant reader. |

### outside-vocabulary-reached-through-a-total-table · MUST

Every vocabulary another party owns, such as its codes and statuses, is reached through a total table to the program's own values. The type checker or a check proves the table complete for every value the program knows, and a code that arrives stays its raw value until the table maps it.

| Why |
|---|
| without a total table a value added to the program's copy of the vocabulary falls through to a default nobody chose — the tolerant reader. |

### outside-code-written-out-on-its-member · MUST

Every member of an enumeration of another party's codes has its code written out. It never takes a code the language counts from the members' order.

| Why |
|---|
| a code counted from the order shifts when a member is added, moved or removed, so the program sends and reads codes the party that owns them gives other meanings, and every check passes. |

### unknown-outside-value-mapped-to-its-own-member · MUST

Every unknown value of a vocabulary its party may extend maps to the program's member for the unknown, never failing the read.

| Why |
|---|
| a value the party adds fails every read that meets it, though the program could have carried it as unknown. |

## Data written as text

### text-encoded-as-utf-8 · MUST

All text the program reads or writes is UTF-8, named wherever a call takes an encoding. It is never left to the platform's default. Exempt: text in an outside format that fixes another encoding, which is decoded where it enters and encoded where it leaves.

| Why |
|---|
| a default encoding differs between machines, so the same bytes read as different text in development and in production. |

### machine-text-independent-of-the-locale · MUST

All machine text is formatted, parsed, compared and cased independently of the locale the process runs in. Such text includes a number, a date, a key and an identifier.

| Why |
|---|
| the same code writes `1,5` for one user and `1.5` for another, or upper-cases `i` to `İ`, and the reader on the other side refuses or misreads it. |

### instant-written-as-an-rfc-3339-date-time · MUST

Every instant in machine text is an RFC 3339 date-time with its offset. Exempt: a time form an outside format or protocol fixes.

| Why |
|---|
| a time written in a form its reader has to guess is read as another moment or rejected — RFC 3339. |

### date-written-as-a-full-date · MUST

Every calendar date in machine text is an RFC 3339 `full-date`, never a date-time at midnight. Exempt: a time form an outside format or protocol fixes.

| Why |
|---|
| a date written as a date-time at midnight falls on the day before for a reader in a zone west of the writer's — RFC 3339. |

### duration-written-as-an-iso-8601-duration · MUST

Every duration in machine text is an ISO 8601 duration, such as `PT90S`, never a bare number. Exempt: a time form an outside format or protocol fixes, and a number in a field whose name carries its unit, such as `timeoutSeconds`, as `value-name-carries-its-unit` asks of a name.

| Why |
|---|
| a duration written as a bare number hides its unit, so its reader takes seconds for milliseconds — ISO 8601. |

### person-set-time-written-with-its-zone · MUST

Every time a person sets, in machine text, carries its wall time and IANA zone, never an instant alone. It is an RFC 9557 date-time with the zone in brackets, such as `2026-10-15T10:00:00+03:00[Europe/Kyiv]`, or a wall time beside a field of its zone. The zone and the wall time win over the offset, and an offset that disagrees with them makes the time inconsistent. Exempt: a time form an outside format or protocol fixes.

| Why |
|---|
| a time a person set, written as an instant alone or read by its offset, moves when its zone's rules change, though the person meant the wall time — RFC 9557, sections 3.3 and 3.4. |

### exact-quantity-written-as-a-decimal · MUST

Every exact quantity in machine text is a decimal or an integer of its smallest unit. It is never a number with a fractional part that its format reads as binary floating point. Exempt: a form an outside format or protocol fixes.

| Why |
|---|
| a reader that parses the quantity as binary floating point holds something other than what was written before its code can turn it into a decimal, and the error reaches every sum made of it. |

### amount-of-money-written-with-its-currency · MUST

Every amount of money in machine text carries its ISO 4217 currency code beside it. Exempt: a form an outside format or protocol fixes.

| Why |
|---|
| an amount written without its currency is read in whatever currency its reader assumes — ISO 4217. |

### mapping-key-unique · MUST

Every key appears once in its mapping written as data, such as an object, a table or a dictionary.

| Why |
|---|
| most parsers keep the last value of a repeated key silently, so the first one reads as set while it does nothing. |

### string-holding-a-backslash-written-literally · MUST

Where its format has a literal form, every string written as data that holds a backslash is written in it. Such strings include a regular expression and a path that uses backslashes.

| Why |
|---|
| a form that reads escapes turns `\b`, `\t` and `\n` into control characters and refuses the others, so the string changes its meaning with no error and still looks the same. |
