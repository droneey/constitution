---
id: pytest
summary: pytest runs Python's specs and holds the coverage gate.
requires: [python]
extends: null
abstract: false
languages: [python]
dictionary: [pytest, pytest-cov, pytest-randomly, pytest-timeout, anyio, conftest.py]
governs: ["**/tests/**"]
---

# pytest

> Runs the specs and holds the coverage gate. `pythonpath = ["tests"]` lets a spec import its fakes and fixtures by their module names. `[tool.pytest]` and `[tool.coverage]` of `pyproject.toml` and the fixtures of `tests/conftest.py` start from the templates in `templates/project/python/` of the constitution's release archive. pytest-cov measures lines and branches, and `addopts` never holds `--cov`, so the gate binds only where it is asked for, never a run of one spec or of a mutant. pytest-timeout fails a case that hangs for ten seconds.

> Core's exclusions from coverage are the entry file, `**/main.py` and `**/__main__.py`, and generated files, `**/*_gen.py`.

## The configuration

### pytest-runs-strict → every-spec-passes
`[tool.pytest]` sets `strict = true`, `--import-mode=importlib` in `addopts` and `filterwarnings = ["error"]`, so a failing case, a warning, an unknown marker or option, and a case marked to fail that passes each fail.

| Why | Tags |
|---|---|
| a warning nobody fails on is read by nobody, and a misspelt marker or option otherwise changes nothing without a word. | [] |

### coverage-gate-with-branches → logic-fully-covered
`[tool.coverage]` measures branches, `branch = true`, and fails when the lines or branches of `src/` fall below 100 percent, `fail_under = 100`, outside core's exclusions, which `omit` lists.

| Why | Tags |
|---|---|
| a branch no case takes is a behaviour nobody proved, though every line of it ran. | [testing] |

### test-order-randomized-by-pytest-randomly → case-independent-of-order
pytest-randomly is installed, so the cases are shuffled and the seed is reported; only the mutation tool turns it off, with `-p no:randomly`.

| Why | Tags |
|---|---|
| pytest keeps the cases in the order it collects them, and the plugin, once installed, shuffles them with no setting. | [] |

### no-test-reruns → flaky-test-fixed-never-retried
No plugin that runs a case again — pytest-rerunfailures, flaky — is installed, and no case is marked `flaky`.

| Why | Tags |
|---|---|
| a case run again passes on its second try and hides the race that failed the first. | [] |

### integration-folders-not-collected → integration-spec-runs-the-real-engine
`norecursedirs` leaves out `tests/integration/` and `tests/e2e/`, and keeps pytest's `.*` for the hidden folders the tools write.

| Why | Tags |
|---|---|
| pytest collects every folder under `tests/`, so only `norecursedirs` keeps the integration and end-to-end specs out of the unit specs, their sandbox and their coverage gate. | [] |

### shared-fixtures-in-the-conftest → test-folder-files-in-python-forms
The fixtures the specs of a folder share are in that folder's `conftest.py`.

| Why | Tags |
|---|---|
| pytest reads each folder's `conftest.py` and hands its fixtures to the specs below it, which import nothing to use them. | [testing] |

## The sandbox

### network-refused-by-the-conftest → unit-spec-refuses-the-network
`tests/conftest.py` holds an autouse fixture that replaces `socket.getaddrinfo`, `socket.socket.connect` and `connect_ex` with functions that raise; `tests/integration/conftest.py` overrides the fixture by its name.

| Why | Tags |
|---|---|
| the standard library's clients, and the libraries built on them, open a connection through these calls of `socket`, and an autouse fixture holds for every spec under its folder with no line in the spec. | [] |

### no-module-patching → effect-faked-never-mocked
No `unittest.mock`, and no `monkeypatch` over a module of the program; `monkeypatch` changes only what the sandbox and the environment hold.

| Why | Tags |
|---|---|
| these are pytest's and Python's ways to put another object in a module's place; the environment has no contract to fake, so `monkeypatch` stays for it. | [] |

### async-specs-by-anyio → async-work-awaited-or-held-by-a-scope
Async specs run on anyio's plugin, with `anyio_mode = "auto"`; pytest-asyncio is not installed.

| Why | Tags |
|---|---|
| one plugin runs every async spec in the task groups the program uses, and two plugins fight over the same specs. | [] |
