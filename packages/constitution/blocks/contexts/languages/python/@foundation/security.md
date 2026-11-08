# Security

> Governs how Python starts processes, reaches interpreters, runs text as code, checks outside paths, unpickles, draws and compares secrets, and matches and compares outside text.

## Secrets

### child-process-given-its-own-env → child-process-variables-built-for-it · MUST

Every process the program starts is passed `env=`, a mapping of environment variables built for it. Whatever starts it, such as `subprocess` or `asyncio.create_subprocess_exec`, its `env` is never left `None` and never `os.environ` itself or a mapping taken whole from it. Exempt: a script that only runs other programs, which passes on what its caller built for them, each secret it received only to the program that reads it.

#### Why

Every one of these calls hands the child all of the program's environment variables when `env` is left out or `None`, a secret among them.

#### Examples

```py title="Avoid"
def render_invoice_pdf(html: Path, pdf: Path) -> None:
    subprocess.run(["/usr/bin/wkhtmltopdf", str(html), str(pdf)], check=True)
```

```py title="Prefer"
def render_invoice_pdf(html: Path, pdf: Path) -> None:
    subprocess.run(
        ["/usr/bin/wkhtmltopdf", str(html), str(pdf)],
        env={"LC_ALL": "C.UTF-8"},
        check=True,
    )
```

## Input from outside

### process-started-with-an-argument-list · MUST

Every process is started with its arguments as a list. It is never started with `shell=True` or by any function that takes the command as one string, such as `os.system`, `os.popen` and `asyncio.create_subprocess_shell`.

#### Why

Each item of a list reaches the program as one argument, while a shell parses the string and runs whatever a value smuggles into it.

#### Examples

```py title="Avoid"
def archive_invoices(folder: Path, archive: Path) -> None:
    subprocess.run(
        f"/usr/bin/tar -czf {archive} {folder}",
        shell=True,
        env={"LC_ALL": "C.UTF-8"},
        check=True,
    )
```

```py title="Prefer"
def archive_invoices(folder: Path, archive: Path) -> None:
    subprocess.run(
        ["/usr/bin/tar", "-czf", str(archive), str(folder)],
        env={"LC_ALL": "C.UTF-8"},
        check=True,
    )
```

### interpreter-input-never-formatted-into-text → outside-input-reaches-interpreters-as-parameters · MUST

No outside input is formatted into a query, markup or a log message. It never reaches one through an f-string, `%` or `str.format`; it travels into a query or markup as the interpreter's parameter. It travels into a log message as a field in `extra=` that the formatter encodes, never as a `%s` argument of the message. Where the `requires-python` floor is 3.14 or later, it may also travel into any of them in a template string `t'…'` that the interpreter's library renders.

#### Why

Text formatted into a query or markup becomes code, while a parameter or a template keeps the input apart from what the library escapes or binds.

#### Examples

```py title="Avoid"
async def find_orders(connection: Connection, email: str) -> list[Record]:
    return await connection.fetch(
        f"SELECT id, total FROM orders WHERE email = '{email}'",
    )


def log_refused_coupon(code: str) -> None:
    _logger.warning("Coupon %s refused", code)
```

```py title="Prefer"
async def find_orders(connection: Connection, email: str) -> list[Record]:
    return await connection.fetch(
        "SELECT id, total FROM orders WHERE email = $1",
        email,
    )


def log_refused_coupon(code: str) -> None:
    _logger.warning("Coupon refused", extra={"coupon_code": code})
```

### text-never-passed-to-eval-or-exec · MUST

No text is run as code. No string is passed to `eval`, `exec` or `compile`, and a literal read from text is parsed by `ast.literal_eval` or a parser of its format.

#### Why

Text that reaches `eval` runs with the program's rights, whoever wrote it.

#### Examples

```py title="Avoid"
def read_shipping_zones(text: str) -> object:
    return eval(text)
```

```py title="Prefer"
def read_shipping_zones(text: str) -> object:
    return ast.literal_eval(text)
```

### outside-path-checked-by-is-relative-to → outside-path-confined-to-its-root · MUST

Every check that a path built from outside input lies inside its root compares two `Path`s by `is_relative_to`. It is never made on their strings, such as by `str.startswith` or `os.path.commonprefix`.

#### Why

A string is compared character by character, so `/srv/data-old` passes as inside `/srv/data`, while `is_relative_to` compares whole parts of the two paths.

#### Examples

```py title="Avoid"
def invoice_file(name: str) -> Path:
    path = (_INVOICE_ROOT / name).resolve()
    if not str(path).startswith(str(_INVOICE_ROOT)):
        raise InvoicePathOutsideRootError(name)

    return path
```

```py title="Prefer"
def invoice_file(name: str) -> Path:
    path = (_INVOICE_ROOT / name).resolve()
    if not path.is_relative_to(_INVOICE_ROOT):
        raise InvoicePathOutsideRootError(name)

    return path
```

### outside-data-never-unpickled → outside-input-never-rebuilt-as-objects · MUST

No data from outside is unpickled. It is never read by a loader that builds objects from what it names, such as `pickle`, `marshal`, `shelve` or any loader built on them, a loader of a model's weights that allows unpickling included.

#### Why

Unpickling calls whatever the data names, so a crafted file runs code with the program's rights.

#### Examples

```py title="Avoid"
def read_cart(body: bytes) -> Cart:
    return pickle.loads(body)
```

```py title="Prefer"
def read_cart(body: bytes) -> Cart:
    return parse_cart(json.loads(body))
```

### re-pattern-on-outside-input-holds-no-nested-quantifier → outside-input-matched-in-linear-time · MUST

No pattern that `re` matches against outside input holds a nested or overlapping quantifier.

#### Why

`re` backtracks and sets no time limit, so it is never the matcher that never backtracks core allows, and a nested quantifier on a crafted input runs for minutes and holds the worker.

#### Examples

```py title="Avoid"
_SKU: Final = re.compile(r"([A-Z0-9]+-?)+")


def is_sku(text: str) -> bool:
    return _SKU.fullmatch(text) is not None
```

```py title="Prefer"
_SKU: Final = re.compile(r"[A-Z0-9][A-Z0-9-]{0,31}")


def is_sku(text: str) -> bool:
    return _SKU.fullmatch(text) is not None
```

### outside-identifier-normalised-by-nfkc-casefold → outside-identifier-normalised-before-comparison · MUST

Where no standard fixes its form, every identifier in outside input that grants or refuses access is normalised as `unicodedata.normalize('NFKC', unicodedata.normalize('NFKC', value).casefold())`. Its case is never folded by `lower()`.

#### Why

Two spellings of one identifier, another Unicode form or another case, otherwise pass a check made on one of them, `casefold()` can undo the NFKC form made before it, and `lower()` misses what `casefold()` folds — the Unicode Standard, section 3.13, and Unicode Standard Annexes #15 and #31.

#### Examples

```py title="Avoid"
def is_administrator(username: str) -> bool:
    return username.lower() in _ADMINISTRATORS
```

```py title="Prefer"
def is_administrator(username: str) -> bool:
    return _normalise(username) in _ADMINISTRATORS


def _normalise(identifier: str) -> str:
    return unicodedata.normalize(
        "NFKC",
        unicodedata.normalize("NFKC", identifier).casefold(),
    )
```

## Primitives

### guarding-value-drawn-from-secrets → guarding-token-from-a-cryptographic-random-source · MUST

No value that guards access is drawn from `random`. A token, a nonce or an identifier that guards access is drawn from the `secrets` module or `uuid.uuid4()`.

#### Why

`random` is a predictable generator whose next values follow from the ones it gave, so whoever sees a few of them guesses the next token, nonce or identifier.

#### Examples

```py title="Avoid"
def new_password_reset_token() -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=32))
```

```py title="Prefer"
def new_password_reset_token() -> str:
    return secrets.token_urlsafe(32)
```

### secret-compared-by-compare-digest → secret-compared-in-constant-time · MUST

Every secret, such as a token, a signature or a key, is compared with `hmac.compare_digest`, never with `==`.

#### Why

`==` stops at the first character that differs, so its timing tells an attacker how much of a guess was right.

#### Examples

```py title="Avoid"
def is_webhook_authentic(payload: bytes, signature: bytes, key: bytes) -> bool:
    expected = hmac.new(key, payload, hashlib.sha256).hexdigest().encode()

    return expected == signature
```

```py title="Prefer"
def is_webhook_authentic(payload: bytes, signature: bytes, key: bytes) -> bool:
    expected = hmac.new(key, payload, hashlib.sha256).hexdigest().encode()

    return hmac.compare_digest(expected, signature)
```
