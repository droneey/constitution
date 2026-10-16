# python-check

> A home in a part's `[homes]` names `edge`, the whole edge; a top-level folder by its name; or `domain`, `adapters` or `app`, that layer of every feature and module of composition.

### relative-import-kept-in-its-module → relative-imports-stay-in-the-module · MUST
A relative import whose target lies outside the importing file's module fails the check — its feature or module of composition, elsewhere its top-level folder, and the import package's own files for a file that sits beside them — and so does such a module's import of itself by its absolute path.

| Why | Tags |
|---|---|
| the linter bans relative imports only all at once, or those that climb past the package. | [] |

### packages-kept-to-their-homes → layer-imports-dependencies-by-its-role · MUST
An import of a package — neither the standard library, the import package itself nor a unit of the workspace — fails the check in a `domain/`, of a feature or of a module of composition, and in `kernel/`; outside the edge, in a folder its home does not name; and, where its home is narrower than the edge, in a folder of the edge its home leaves out. The edge is `adapters/` — a feature's and a module of composition's among them — `libs/`, `root/`, `integrations/` and the entry files; a top-level folder the tree does not name is no part of it.

| Why | Tags |
|---|---|
| an import contract forbids a package only by its name, one contract per package, and knows nothing of a package nobody named; the check reads every import against the table and the homes the parts give. | [] |

### effect-modules-kept-at-the-edge → effects-held-only-by-the-edge · MUST
A module of the standard library that reaches input and output, the clock or randomness — `os`, `subprocess`, `socket`, `time`, `random` among them — fails the check outside the edge, and so does an effectful name of a module whose types are pure — `urllib.request`, `uuid.uuid4`, `datetime.now()`, `open()` — and a timer, `asyncio.sleep` or `threading.Timer`, outside the edge and the binding units of `app/`.

| Why | Tags |
|---|---|
| the standard library needs no install, so no table of homes sees it, and an effect reached from a use case stays out of every fake its specs give it. | [] |

### environment-read-held-to-the-root → environment-read-only-under-root · MUST
A read or a change of the environment — `os.environ`, `os.getenv`, `os.putenv` and their kin — fails the check at the edge outside `root/` and the entry files; below the edge, `os` itself fails.

| Why | Tags |
|---|---|
| no linter of Python knows which folder is the root, and an adapter that reads the environment passes every import contract. | [security] |
