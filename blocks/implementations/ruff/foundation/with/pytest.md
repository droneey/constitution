# Ruff with pytest

> The specs' rules. The part `presets/python/ruff/foundation/pytest.toml` extends `python.toml` with pytest's style (`PT`) and the bans below, and a project that tests with pytest extends it, the last link of the chain.

## skips-and-expected-failures-banned → no-skipped-or-empty-tests
`pytest.skip`, `pytest.xfail`, `pytest.importorskip` and the marks `skip`, `skipif` and `xfail` are banned.

| Why | Check | Tags |
|---|---|---|
| these are pytest's ways to leave a case unrun or let it fail. | tool/lint | [testing] |

## flaky-mark-banned → no-test-reruns
The mark `flaky`, which the plugins that run a case again read, is banned.

| Why | Check | Tags |
|---|---|---|
| a case marked so is run again whenever such a plugin is installed. | tool/lint | [testing] |

## unittest-mock-banned → no-module-patching
`unittest.mock` is banned.

| Why | Check | Tags |
|---|---|---|
| it is how a spec patches a module or verifies calls in place of a fake. | tool/lint | [testing] |

## pytest-asyncio-banned → async-specs-by-anyio
`pytest_asyncio` is banned.

| Why | Check | Tags |
|---|---|---|
| a spec that imports it runs on a second plugin beside anyio's. | tool/lint | [testing] |

## specs-lift-only-assert-and-package-rules · SHOULD
The project's `extend-per-file-ignores` lifts only `S101` and `INP001` in `tests/**`: a case asserts with `assert`, and `tests/` is no package.

| Why | Check | Tags |
|---|---|---|
| each other rule holds for the specs as for the program; a spec is code a reader must trust. | review | [testing] |
