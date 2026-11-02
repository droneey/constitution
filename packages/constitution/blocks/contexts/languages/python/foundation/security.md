# Security

> Governs how Python starts processes, reaches interpreters, confines outside paths, unpickles, draws and compares secrets, and matches and compares outside text.

## Secrets

### child-process-given-its-own-env → child-process-environment-built-for-it · MUST

A process the program starts is passed `env=` a mapping built for it. This holds for a process started through `subprocess` or `asyncio.create_subprocess_exec`, whose `env` is never left to `None` and never given a copy of `os.environ`.

| Why |
|---|
| every one of these calls copies the program's whole environment into the child when `env` is left out or `None`, a secret among it. |

## Input from outside

### process-started-with-an-argument-list → outside-input-reaches-interpreters-as-parameters · MUST

A process is started with its arguments as a list. It is started by `subprocess.run([...])` or `asyncio.create_subprocess_exec`, never with `shell=True`, `os.system` or `os.popen`.

| Why |
|---|
| each item of a list reaches the program as one argument, while a shell parses the string and runs whatever a value smuggles into it. |

### interpreter-input-never-formatted-into-text → outside-input-reaches-interpreters-as-parameters · MUST

Outside input is never formatted into a query, markup or a log message. It never reaches one through an f-string, `%` or `str.format`; it travels as the interpreter's parameter — for a log message, a field in `extra=` that the formatter encodes, never a `%s` argument of the message — or in a template string `t'…'` that the interpreter's library renders.

| Why |
|---|
| text formatted into a query or markup becomes code, while a parameter or a template keeps the input apart from what the library escapes or binds. |

### text-never-run-as-code → outside-input-reaches-interpreters-as-parameters · MUST

Text is never run as code. No string is passed to `eval`, `exec` or `compile`, and a literal read from text is parsed by `ast.literal_eval` or a parser of its format.

| Why |
|---|
| text that reaches `eval` runs with the program's rights, whoever wrote it. |

### outside-path-confined-after-resolve → outside-path-confined-to-its-root · MUST

A path built from outside input is used only once its resolved form lies inside its root. It is joined to its root, resolved with `Path.resolve()`, and refused unless `is_relative_to(root.resolve())` holds for it; where another writer can change the tree, the file is opened with `os.O_NOFOLLOW` and its `os.fstat` device and inode are compared with those of the checked path.

| Why |
|---|
| a `..` or a symbolic link otherwise walks out of the root, and a check on the unresolved string misses both. |

### outside-data-never-unpickled → outside-input-never-rebuilt-as-objects · MUST

Data from outside is never unpickled. It is never read by a loader that builds objects from what it names — `pickle`, `marshal`, `shelve`, `dill`, `jsonpickle`, `torch.load` with `weights_only=False`.

| Why |
|---|
| unpickling calls whatever the data names, so a crafted file runs code with the program's rights. |

### outside-pattern-safe-or-on-a-linear-engine → outside-input-matched-in-linear-time · MUST

A regular expression that runs on outside input has no nested or overlapping quantifiers, or runs on a linear-time engine. A quantifier is possessive or atomic where it needs one.

| Why |
|---|
| `re` backtracks, so a nested quantifier on a crafted input runs for minutes and holds the worker. |

### outside-identifier-normalised-and-casefolded → outside-identifier-normalised-before-comparison · MUST

An identifier from outside is compared as `unicodedata.normalize('NFKC', value).casefold()`, never as it arrived and never by `lower()`. A host name, whose own standard fixes its form, is exempt.

| Why |
|---|
| two spellings of one name, another Unicode form or another case, otherwise pass a check made on one of them, and `lower()` misses what `casefold()` folds — Unicode Standard Annexes #15 and #31. |

## Primitives

### guarding-value-drawn-from-secrets → security-primitive-from-a-vetted-library · MUST

A value that guards access is never drawn from `random`. A token, a nonce or an identifier that guards access is drawn from the `secrets` module or `uuid.uuid4()`.

| Why |
|---|
| `random` is a predictable generator whose next values follow from the ones it gave, so whoever sees a few of them guesses the next token, nonce or identifier. |

### secret-compared-by-compare-digest → security-primitive-from-a-vetted-library · MUST

A secret — a token, a signature, a key — is compared with `hmac.compare_digest`, never with `==`.

| Why |
|---|
| `==` stops at the first character that differs, so its timing tells an attacker how much of a guess was right. |
