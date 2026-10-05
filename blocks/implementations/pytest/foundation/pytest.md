# pytest

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

## test-order-randomized-by-pytest-randomly → specs-independent-of-order
pytest-randomly shuffles the cases on every run and prints the seed that replays a failure; only the run of each mutant turns it off, with `-p no:randomly`.

| Why | Check | Tags |
|---|---|---|
| a case that leans on another fails in some order, and the seed lets anyone run that order again. | review | [] |

## no-test-reruns → flaky-test-fixed-or-removed
No plugin that runs a case again — pytest-rerunfailures, flaky — is installed, and no case is marked `flaky`.

| Why | Check | Tags |
|---|---|---|
| a case run again passes on its second try and hides the race that failed the first. | review | [] |

## integration-folder-runs-apart → integration-tested-against-the-real-engine
The unit run leaves out `tests/integration/` and `tests/e2e/` by `norecursedirs`, which keeps pytest's `.*` for the hidden folders the tools write; integration specs run as their own task of the check, `pytest tests/integration`.

| Why | Check | Tags |
|---|---|---|
| the fast run stays fast, and the slower integration run fails on its own. | review | [] |

## The sandbox

## network-refused-by-the-conftest → tests-run-in-a-sandbox
`tests/conftest.py` holds an autouse fixture that replaces `socket.getaddrinfo`, `socket.socket.connect` and `connect_ex` with functions that raise, so a unit spec that opens a connection fails; `tests/integration/conftest.py` overrides the fixture by its name.

| Why | Check | Tags |
|---|---|---|
| a spec that reaches a server by mistake passes while the server answers and fails at random when it does not; refused at once, it fails where the mistake is. | review | [] |

## no-module-patching → one-fake-per-contract
No `unittest.mock`, and no `monkeypatch` over a module of the program: an effect is replaced by the fake of its contract, and `monkeypatch` changes only what the sandbox and the environment hold.

| Why | Check | Tags |
|---|---|---|
| a patched module replaces code the spec claims to test, and breaks when the module moves. | review | [] |

## async-specs-by-anyio → structured-concurrency
Async specs run on anyio's plugin, with `anyio_mode = "auto"`; pytest-asyncio is not installed.

| Why | Check | Tags |
|---|---|---|
| one plugin runs every async spec in the task groups the program uses, and two plugins fight over the same specs. | review | [] |
