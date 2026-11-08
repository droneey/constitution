# Data

> Governs text in Python: the encoding a call names and machine text.

## Text

### text-opened-with-utf-8-named → text-encoded-as-utf-8 · MUST

Every call that opens or decodes text names `encoding='utf-8'`. Such calls include `open`, `Path.open`, `Path.read_text`, `Path.write_text` and a `subprocess` call with `text=True`. Exempt: text in an outside format that fixes another encoding, whose call names that encoding.

| Why |
|---|
| below Python 3.15 these calls default to the machine's locale, and from 3.15 a host's `PYTHONUTF8=0` brings it back, so the same file reads as different text on two machines. |

### machine-text-uses-no-locale-module-or-locale-format-code → machine-text-independent-of-the-locale · MUST

No machine text is formatted or parsed by the `locale` module, `'{:n}'` or a `strftime` or `strptime` directive that reads the locale. Such directives include `%a`, `%A`, `%b`, `%B`, `%c`, `%p`, `%x` and `%X`.

| Why |
|---|
| these forms read the locale of the process, so the same value is written differently on each machine. |
