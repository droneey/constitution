# Sandbox

> Governs the sandbox the specs run in: the network, patching, waits and async specs.

## General

### network-refused-by-the-conftest → unit-spec-refuses-the-network · MUST

`tests/conftest.py` holds an autouse fixture that replaces `socket.getaddrinfo`, `socket.socket.connect` and `connect_ex` with functions that raise; `tests/integration/conftest.py` overrides the fixture by its name.

| Why |
|---|
| the standard library's clients, and the libraries built on them, open a connection through these calls of `socket`, and an autouse fixture holds for every spec under its folder with no line in the spec. |

### module-never-patched-in-a-spec → effect-faked-never-mocked · SHOULD

No `unittest.mock`, and no `monkeypatch` over a module of the program; `monkeypatch` changes only what the sandbox and the environment hold.

| Why |
|---|
| these are pytest's and Python's ways to put another object in a module's place; the environment has no contract to fake, so `monkeypatch` stays for it. |

### async-specs-by-anyio → async-work-awaited-or-held-by-a-scope · MUST

Async specs run on anyio's plugin, with `anyio_mode = "auto"`; pytest-asyncio is not installed.

| Why |
|---|
| one plugin runs every async spec in the task groups the program uses, and two plugins fight over the same specs. |

### spec-never-calls-a-sleep → test-never-sleeps-a-fixed-time · SHOULD

A spec never calls `time.sleep`, nor `asyncio.sleep` or `anyio.sleep` with a delay above zero.

| Why |
|---|
| these are the fixed delays a Python spec reaches for; the anyio clock or a wait on a condition replaces them. |
