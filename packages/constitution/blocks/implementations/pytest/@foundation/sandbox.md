# Sandbox

> Governs the sandbox the specs run in: the network, patching and waits.

## General

### network-refused-by-the-conftest → unit-spec-refuses-the-network · MUST

Every unit spec runs with the network refused by an autouse fixture of `tests/conftest.py`. It replaces `socket.getaddrinfo`, `socket.socket.connect` and `connect_ex` with functions that raise. Exempt: the integration specs, whose `tests/integration/conftest.py` overrides the fixture by its name.

| Why |
|---|
| the standard library's clients, and the libraries built on them, open every connection through these calls of `socket`, so a spec that reaches a server past them talks to the world, and a refusal each spec must write is missing from the first spec that forgets it; an autouse fixture holds for every spec under its folder with no line in the spec — fail fast. |

### module-never-patched-in-a-spec → effect-faked-never-mocked · MUST

No spec patches a module of the program. It uses no `unittest.mock`, and `monkeypatch` changes only what the sandbox and the environment hold.

| Why |
|---|
| an object put in a module's place by `unittest.mock` or `monkeypatch` replaces the code the spec claims to test and breaks when the module moves; the environment has no contract to fake, so `monkeypatch` stays for it. |

### spec-never-calls-a-sleep → test-never-sleeps-a-fixed-time · SHOULD

No spec calls `time.sleep`, nor `asyncio.sleep` or `anyio.sleep` with a delay above zero.

| Why |
|---|
| a fixed delay is too short on a slow machine and wasted on a fast one, and these are the calls a Python spec makes it with; the anyio clock or a wait on a condition replaces them. |
