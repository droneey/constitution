# Configuration

> Governs pytest's configuration: strictness, the coverage gate, the order of the cases, retries, the folders it collects and where fixtures live.

## Gates

### pytest-runs-strict → every-spec-passes · MUST

`[tool.pytest]` sets `strict = true`, `--import-mode=importlib` in `addopts` and `filterwarnings = ["error"]`, so a failing case, a warning, an unknown marker or option, and a case marked to fail that passes each fail.

| Why | Tags |
|---|---|
| a warning nobody fails on is read by nobody, and a misspelt marker or option otherwise changes nothing without a word. | [] |

### coverage-gate-with-branches → logic-fully-covered · MUST

`[tool.coverage]` measures branches, `branch = true`, and fails when the lines or branches of `src/` fall below 100 percent, `fail_under = 100`, outside core's exclusions, which `omit` lists; the gate's run collects the integration specs beside the unit specs, `-o "norecursedirs=.* e2e"`, so the code over an engine the sandbox runs counts by its integration specs.

| Why | Tags |
|---|---|
| a branch no case takes is a behaviour nobody proved, though every line of it ran. | [testing] |

## Order and retries

### test-order-randomized-by-pytest-randomly → case-independent-of-order · SHOULD

pytest-randomly is installed, so the cases are shuffled and the seed is reported; only the mutation tool turns it off, with `-p no:randomly`.

| Why | Tags |
|---|---|
| pytest keeps the cases in the order it collects them, and the plugin, once installed, shuffles them with no setting. | [] |

### failed-test-never-retried-by-a-plugin → flaky-test-fixed-never-retried · SHOULD

No plugin that runs a case again — pytest-rerunfailures, flaky — is installed, and no case is marked `flaky`.

| Why | Tags |
|---|---|
| a case run again passes on its second try and hides the race that failed the first. | [] |

## Collection and fixtures

### integration-folders-not-collected → integration-spec-runs-the-real-engine · SHOULD

`norecursedirs` leaves out `tests/integration/` and `tests/e2e/`, and keeps pytest's `.*` for the hidden folders the tools write; only the coverage gate's run lifts `integration` from it.

| Why | Tags |
|---|---|
| pytest collects every folder under `tests/`, so only `norecursedirs` keeps the integration and end-to-end specs out of a run of the unit specs and of each mutant's run, and pytest drops a folder named on its command line beside its parent, so the gate's run lifts it from the list instead. | [] |

### shared-fixtures-in-the-conftest → test-folder-files-in-python-forms · MUST

pytest's fixtures — the functions the specs of a folder share by name — are in that folder's `conftest.py`; core's fixtures, the factories of valid values, stay in `<name>_fixtures.py`.

| Why | Tags |
|---|---|
| pytest reads each folder's `conftest.py` and hands its fixtures to the specs below it, which import nothing to use them. | [testing] |
