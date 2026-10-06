# pytest

> Core's exclusions from coverage are the entry file, `**/main.py` and `**/__main__.py`, and generated files, `**/*_gen.py`.

## The run

## pytest-runs-strict → tests-pass-in-check
The check runs `pytest` with `strict = true`, `--import-mode=importlib` and `filterwarnings = ["error"]`, so a failing case, a warning, an unknown marker or option, and a case marked to fail that passes each fail the run.

| Why | Check | Tags |
|---|---|---|
| a warning nobody fails on is read by nobody, and a misspelt marker or option otherwise changes nothing without a word. | tool/tests | [] |

## coverage-gate-with-branches → coverage-holds-all-logic
`pytest --cov` fails when the lines or branches of `src/` fall below 100 percent, outside core's exclusions, which `omit` lists.

| Why | Check | Tags |
|---|---|---|
| a branch no case takes is a behaviour nobody proved, though every line of it ran. | tool/coverage | [testing] |

## test-order-randomized-by-pytest-randomly → case-order-shuffled-with-a-seed
pytest-randomly shuffles the cases on every run and prints its seed; only the run of each mutant turns it off, with `-p no:randomly`.

| Why | Check | Tags |
|---|---|---|
| pytest runs the cases in the order it collects them, and the plugin, once installed, shuffles every run with no setting. | review | [] |

## no-test-reruns → flaky-test-fixed-or-removed
No plugin that runs a case again — pytest-rerunfailures, flaky — is installed, and no case is marked `flaky`.

| Why | Check | Tags |
|---|---|---|
| a case run again passes on its second try and hides the race that failed the first. | review | [] |

## integration-folder-runs-apart → integration-specs-in-their-own-run
The unit run leaves out `tests/integration/` and `tests/e2e/` by `norecursedirs`, which keeps pytest's `.*` for the hidden folders the tools write; integration specs run as their own task of the check, `pytest tests/integration`.

| Why | Check | Tags |
|---|---|---|
| pytest collects every folder under `tests/`, so only `norecursedirs` keeps the integration specs out of the unit run. | review | [] |

## shared-fixtures-in-the-conftest → test-folder-files-in-python-forms
The fixtures the specs of a folder share are in that folder's `conftest.py`.

| Why | Check | Tags |
|---|---|---|
| pytest reads each folder's `conftest.py` and hands its fixtures to the specs below it, which import nothing to use them. | review | [testing] |

## The sandbox

## network-refused-by-the-conftest → network-refused-in-the-unit-run
`tests/conftest.py` holds an autouse fixture that replaces `socket.getaddrinfo`, `socket.socket.connect` and `connect_ex` with functions that raise; `tests/integration/conftest.py` overrides the fixture by its name.

| Why | Check | Tags |
|---|---|---|
| the standard library's clients, and the libraries built on them, open a connection through these calls of `socket`, and an autouse fixture holds for every spec under its folder with no line in the spec. | review | [] |

## no-module-patching → effects-faked-never-mocked
No `unittest.mock`, and no `monkeypatch` over a module of the program; `monkeypatch` changes only what the sandbox and the environment hold.

| Why | Check | Tags |
|---|---|---|
| these are pytest's and Python's ways to put another object in a module's place; the environment has no contract to fake, so `monkeypatch` stays for it. | review | [] |

## async-specs-by-anyio → structured-concurrency
Async specs run on anyio's plugin, with `anyio_mode = "auto"`; pytest-asyncio is not installed.

| Why | Check | Tags |
|---|---|---|
| one plugin runs every async spec in the task groups the program uses, and two plugins fight over the same specs. | review | [] |
