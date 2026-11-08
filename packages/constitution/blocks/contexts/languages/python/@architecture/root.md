# Root

> Governs the composition root in Python: the one function every way of starting the program calls.

## Entries

### program-entry-is-main-of-main-py → entry-file-hands-the-process-to-the-program · SHOULD

Every program's entry is the function `main()` of its entry file at the top of the import package. `__main__.py` and the script `[project.scripts]` names only call it.

#### Why

A program started its own way by its script, by `python -m` and by its host runs a different start in each, and a fix made to one misses the others.

#### Examples

```py title="Avoid"
# src/shop/__main__.py
from shop.root import run_program

run_program()

# src/shop/cli.py
from shop.root import run_program


def start() -> None:
    run_program(workers=4)  # a start of its own
```

```py title="Prefer"
# src/shop/main.py
from shop.root import run_program


def main() -> None:
    run_program()

# src/shop/__main__.py
from shop.main import main

main()
```
