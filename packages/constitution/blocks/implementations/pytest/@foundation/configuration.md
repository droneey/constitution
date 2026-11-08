# Configuration

> Governs pytest's configuration: strictness, the coverage gate, the order of the cases, retries, the folders it collects, how it imports test modules, where fixtures live and the plugin that runs async specs.

## Gates

### pytest-runs-strict · MUST

Every pytest run is strict. A warning, and an unknown marker or option, each fail the run: `[tool.pytest]` sets `strict = true` and `filterwarnings = ["error"]`.

| Why |
|---|
| a warning nobody fails on is read by nobody, and a misspelt marker or option otherwise changes nothing without a word. |

### coverage-gate-with-branches → logic-fully-covered · MUST

The coverage gate measures branches and fails below 100 percent of the lines and branches of `src/`. `[tool.coverage.run]` sets `branch = true` and lists in `omit` the code a project leaves out, `[tool.coverage.report]` sets `fail_under = 100`, and the gate's run collects the integration specs beside the unit specs.

| Why |
|---|
| a branch no case takes is a behaviour nobody proved, though every line of it ran, so a gate on lines alone passes it, and the code over an engine counts only in the run that drives it on that engine. |

## Order and retries

### test-order-randomized-by-pytest-randomly → case-order-shuffled · SHOULD

Every pytest run shuffles its cases through pytest-randomly. Exempt: a run of the mutation tool.

| Why |
|---|
| pytest keeps the cases in the order it collects them, so a case that leans on another passes in every run until someone runs it alone; the plugin, once installed, shuffles them with no setting. |

### failed-test-never-retried-by-a-plugin → flaky-test-fixed-never-retried · MUST

No plugin that runs a case again, such as pytest-rerunfailures or flaky, is installed, and no case is marked `flaky`.

| Why |
|---|
| a case run again passes on its second try and hides the race that failed the first. |

## Collection and fixtures

### test-modules-imported-by-importlib → specs-in-a-tests-tree-beside-src · MUST

Every test module is imported by importlib. `addopts` holds `--import-mode=importlib`.

| Why |
|---|
| the mirrored `tests/` tree is no package, so pytest's default import mode puts each spec's folder on the path and refuses two test modules of one name in two folders, though the mirror of the source gives them that name. |

### integration-folders-not-collected → unit-case-stays-in-process · MUST

Every run of the unit specs collects no integration or end-to-end spec. `norecursedirs` leaves out the folders named `integration` and `e2e`, and keeps pytest's `.*` for the hidden folders the tools write. Exempt: a run that needs the integration specs, such as the coverage gate's or a mutant's, which lifts `integration` from the list by `-o "norecursedirs=.* e2e"`.

| Why |
|---|
| pytest collects every folder under `tests/`, so without `norecursedirs` each run of the unit specs also runs the integration and end-to-end specs and waits on their engines; pytest drops a folder named on its command line beside its parent, so a run that needs the integration specs lifts it from the list. |

### shared-fixtures-in-the-conftest · SHOULD

Every pytest fixture that the specs of a folder share is defined in that folder's `conftest.py`. A pytest fixture is a function pytest hands a spec by its parameter's name; the factories of valid values the tests chapter calls fixtures keep their own files.

| Why |
|---|
| pytest reads each folder's `conftest.py` and hands its fixtures to the specs below it, which import nothing to use them, so a shared fixture kept anywhere else is imported into each spec by hand or copied into it. |

## Async specs

### async-specs-by-anyio · MUST

Every async spec runs on AnyIO's pytest plugin. It runs with `anyio_mode = "auto"`, and pytest-asyncio is not installed.

| Why |
|---|
| one plugin runs every async spec in the task groups the program uses, and two plugins fight over the same specs. |
