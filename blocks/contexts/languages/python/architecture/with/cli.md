# Python with command line

> The command line of a Python program: its delivery layer is the package `cli/` of the import package.

## python-commands-in-cli-modules → commands-in-the-cli-folder
`cli/` holds one module `<name>_cli.py` per command and, beside them, the shared flags in modules named in one word — `flags.py` — since in Python a second word reads as a role. `root/wiring.py` registers every command into the application of the command-line library — Typer, Click or `argparse` — and `[project.scripts]` and `__main__.py` both run that application through `main()` of the entry `main.py`.

| Why | Check | Tags |
|---|---|---|
| the program then has one list of its commands and one way in, whether it is run by its script's name or by `python -m`. | review | [] |
