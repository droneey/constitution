# Workspace

> Governs the distribution and import names of a Python workspace's packages, and the data one reads of another.

## Names

### distribution-name-opens-with-the-namespace → package-name-under-the-repositorys-namespace · SHOULD

Every Python package of the repository is distributed under a name that opens with `<namespace>-`, its `<namespace>` the repository's own.

#### Why

A registry with no namespaces of its own gives a name to whoever claims it first, so a package named without the repository's prefix collides with another owner's, and its consumer cannot tell which packages come from one repository.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/pyproject.json
# packages/invoices/pyproject.toml
[project]
name = "invoices"
```

```toml title="Prefer"
#:schema https://json.schemastore.org/pyproject.json
# packages/invoices/pyproject.toml
[project]
name = "acme-invoices"
```

### import-name-opens-with-the-namespace · SHOULD

Every Python package of the repository is imported by its distribution's name with an underscore for each hyphen. Its import name thus opens with the repository's namespace and an underscore.

#### Why

An import name apart from the distribution's is looked for under the wrong name, and one without the repository's prefix can collide with another installed top-level package.

#### Examples

```text title="Avoid"
packages/invoices/
├── pyproject.toml
└── src/
    └── invoices/           distributed as acme-invoices, imported as invoices
        └── __init__.py
```

```text title="Prefer"
packages/invoices/
├── pyproject.toml
└── src/
    └── acme_invoices/
        └── __init__.py
```

## Shared data

### shared-data-read-through-its-import-package → file-lives-once-across-units · MUST

Every Python package reads another package's data through that package's import package. It imports the import package and reads through `importlib.resources.files()` of it, never by a path or by the package's name in a string.

#### Why

A path reaches the data only where the working tree lays it out, so the installed package misses it, and a name in a string hides the dependency from the checker of declared dependencies.

#### Examples

```py title="Avoid"
_VAT_RATES: Final = Path(__file__).parents[3] / "tax/src/acme_tax/data/vat_rates.csv"


def read_vat_rates() -> str:
    return _VAT_RATES.read_text(encoding="utf-8")
```

```py title="Prefer"
from importlib.resources import files

import acme_tax


def read_vat_rates() -> str:
    return files(acme_tax).joinpath("data/vat_rates.csv").read_text(encoding="utf-8")
```
