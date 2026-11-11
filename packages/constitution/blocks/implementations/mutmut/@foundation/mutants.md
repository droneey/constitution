# Mutants

> Governs the mutation run — what it leaves out, how it runs pytest and how specs find files — and how an equivalent mutant is marked.

## General

### text-for-a-person-left-out-by-configuration → every-mutant-killed · MUST

mutmut's configuration leaves out text only a person reads, where a line or a file holds nothing else. It leaves out the calls of the module's `logger`, the name the standard library's logging guide gives it, by `do_not_mutate_patterns`, and the modules of messages by `do_not_mutate`.

#### Why

A log call's level and text, and a module of messages, which holds text and the templates that fill it with no branch, are no behaviour a caller relies on, so their mutants live unless a case pins wording; mutmut leaves out no kind of mutant narrower than a file or a line.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/pyproject.json
# pyproject.toml
[tool.mutmut]
source_paths = ["src"]
```

```toml title="Prefer"
#:schema https://json.schemastore.org/pyproject.json
# pyproject.toml
[tool.mutmut]
source_paths = ["src"]
do_not_mutate = ["*_messages.py"]
do_not_mutate_patterns = ['^\s*logger\.(debug|info|warning|error|exception|critical)\(']
```

### mutants-run-without-the-gates → every-mutant-killed · MUST

Every mutant's run is pytest without the coverage gate. `addopts` holds no `--cov`, so the gate of `coverage-gate-with-branches` runs only in its own run.

#### Why

A mutant's run is pytest over the few specs that reach the mutant, which a gate over the whole of `src/` fails on its `fail_under`, so every mutant would count as killed whatever its specs find.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/pyproject.json
# pyproject.toml
[tool.pytest.ini_options]
addopts = ["--strict-markers", "--cov=src"]

[tool.coverage.run]
branch = true

[tool.coverage.report]
fail_under = 100
```

```toml title="Prefer"
#:schema https://json.schemastore.org/pyproject.json
# pyproject.toml
[tool.pytest.ini_options]
addopts = ["--strict-markers"]

[tool.coverage.run]
branch = true

[tool.coverage.report]
fail_under = 100
```

### mutants-run-the-specs-the-gate-counts → every-mutant-killed · MUST

Every mutant's run collects the specs the coverage gate counts, the integration specs included. Its `pytest_add_cli_args` lifts `integration` from `norecursedirs`, as `integration-folders-not-collected` allows.

#### Why

`norecursedirs` without `integration` lets each mutant's run collect the integration specs, as the gate's run does, so a mutant only an integration spec kills is not left alive.

#### Examples

```toml title="Avoid"
#:schema https://json.schemastore.org/pyproject.json
# pyproject.toml
[tool.pytest.ini_options]
norecursedirs = [".*", "integration", "e2e"]

[tool.mutmut]
source_paths = ["src"]
```

```toml title="Prefer"
#:schema https://json.schemastore.org/pyproject.json
# pyproject.toml
[tool.pytest.ini_options]
norecursedirs = [".*", "integration", "e2e"]

[tool.mutmut]
source_paths = ["src"]
pytest_add_cli_args = ["-p", "no:randomly", "-o", "norecursedirs=.* e2e"]
```

### spec-finds-files-by-searching-up → every-mutant-killed · MUST

Every spec finds a file outside `tests/` by searching up from `Path(__file__)`, never by counting `Path(__file__).parents` to a fixed depth.

#### Why

Mutmut copies `src/` and `tests/` into `mutants/` and runs the specs there, a folder deeper, so a fixed count misses the file and the specs fail before any mutant runs.

#### Examples

```py title="Avoid"
_FIXTURES: Final = Path(__file__).parents[2] / "fixtures" / "invoices"
```

```py title="Prefer"
def _find_up(name: str) -> Path:
    for folder in Path(__file__).parents:
        if (folder / name).exists():
            return folder / name
    raise FileNotFoundError(name)


_FIXTURES: Final = _find_up("fixtures") / "invoices"
```

### equivalent-mutant-marked-by-pragma → suppression-silences-one-finding · MUST

Every mutant the code keeps is marked on its line by `# pragma: no mutate`. Such a mutant is an equivalent one, or one in text only a person reads where the configuration does not leave that text out, an error's message included; none is marked by the pragma's `block`, `start` and `end`, `function` or `class` forms, nor by `do_not_mutate` over a file of logic.

#### Why

The pragma names no mutator, so its line is the narrowest mark mutmut has, and its other forms reach a whole block, function, class or file; an error's text has no line a pattern can tell, since the linter has it assigned to a variable before the `raise`, a pattern over `raise` would leave out the error's other arguments too, and one over `super().__init__(` the arguments a framework's base takes as behaviour.

#### Examples

```py title="Avoid"
def export_invoices(invoices: Iterable[Invoice], sink: InvoiceSink) -> None:
    # pragma: no mutate start  # Why: the batch size changes no result
    for batch in itertools.batched(invoices, 500):
        sink.write(batch)
    # pragma: no mutate end
```

```py title="Prefer"
def export_invoices(invoices: Iterable[Invoice], sink: InvoiceSink) -> None:
    for batch in itertools.batched(invoices, 500):  # pragma: no mutate  # Why: the batch size changes no result
        sink.write(batch)
```
