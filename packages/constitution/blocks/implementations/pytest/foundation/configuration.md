# Configuration

> Governs pytest's configuration: strictness, the coverage gate, the order of the cases, retries, the folders it collects, how it imports test modules, where fixtures live and the plugin that runs async specs.

## Gates

### pytest-runs-strict → change-handed-back-with-a-passing-check · MUST

pytest runs strict. A failing case, a warning, and an unknown marker or option each fail the run: `[tool.pytest]` sets `strict = true` and `filterwarnings = ["error"]`.

| Why |
|---|
| a warning nobody fails on is read by nobody, and a misspelt marker or option otherwise changes nothing without a word. |

### coverage-gate-with-branches → logic-fully-covered · MUST

The coverage gate counts branches as well as lines, over the unit and the integration specs. `[tool.coverage]` measures branches, `branch = true`, and fails when the lines or branches of `src/` fall below 100 percent, `fail_under = 100`, outside core's exclusions, which `omit` lists; the gate's run collects the integration specs beside the unit specs, so the code over an engine the sandbox runs counts by its integration specs.

| Why |
|---|
| a branch no case takes is a behaviour nobody proved, though every line of it ran, so a gate on lines alone passes it, and the code over an engine counts only in the run that drives it on that engine. |

## Order and retries

### test-order-randomized-by-pytest-randomly → case-independent-of-order · SHOULD

pytest-randomly is installed, so the cases are shuffled and the seed is reported. Only the mutation tool turns it off, with `-p no:randomly`.

| Why |
|---|
| pytest keeps the cases in the order it collects them, so a case that leans on another passes in every run until someone runs it alone, and a run that turns the plugin off hides it again; the plugin, once installed, shuffles them with no setting. |

### failed-test-never-retried-by-a-plugin → flaky-test-fixed-never-retried · SHOULD

No plugin that runs a case again — pytest-rerunfailures, flaky — is installed, and no case is marked `flaky`.

| Why |
|---|
| a case run again passes on its second try and hides the race that failed the first. |

## Collection and fixtures

### test-modules-imported-by-importlib → specs-in-a-tests-tree-beside-src · MUST

pytest imports test modules by importlib. `addopts` holds `--import-mode=importlib`.

| Why |
|---|
| the mirrored `tests/` tree is no package, so pytest's default import mode puts each spec's folder on the path and refuses two test modules of one name in two folders, though the mirror of the source gives them that name. |

### integration-folders-not-collected → unit-case-stays-in-process · SHOULD

A run of the unit specs collects no integration or end-to-end spec. `norecursedirs` leaves out `tests/integration/` and `tests/e2e/`, and keeps pytest's `.*` for the hidden folders the tools write; a run that collects the integration specs lifts `integration` from it, `-o "norecursedirs=.* e2e"`.

| Why |
|---|
| pytest collects every folder under `tests/`, so without `norecursedirs` each run of the unit specs also runs the integration and end-to-end specs and waits on their engines; pytest drops a folder named on its command line beside its parent, so a run that needs the integration specs lifts it from the list instead. |

### shared-fixtures-in-the-conftest → test-folder-files-in-python-forms · MUST

pytest's shared fixtures live in their folder's `conftest.py`. These are the functions the specs of a folder share by name; core's fixtures, the factories of valid values, stay in `<name>_fixtures.py`.

| Why |
|---|
| pytest reads each folder's `conftest.py` and hands its fixtures to the specs below it, which import nothing to use them, so a shared fixture kept anywhere else is imported into each spec by hand or copied into it. |

## Async specs

### async-specs-by-anyio → async-work-awaited-or-held-by-a-scope · MUST

Async specs run on anyio's plugin. It runs with `anyio_mode = "auto"`, and pytest-asyncio is not installed.

| Why |
|---|
| one plugin runs every async spec in the task groups the program uses, and two plugins fight over the same specs. |
