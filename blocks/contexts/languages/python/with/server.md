# Python with server

> Governs the processes a Python server starts.

## Server

### child-process-given-its-own-env → child-process-environment-built-for-it · MUST
A process the server starts — through `subprocess` or `asyncio.create_subprocess_exec` — is passed `env=` a mapping built for it, never left to `env=None` and never given a copy of `os.environ`.

| Why | Tags |
|---|---|
| every one of these calls copies the server's whole environment into the child when `env` is left out or `None`, a secret among it. | [security] |
