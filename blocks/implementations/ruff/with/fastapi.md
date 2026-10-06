# Ruff with FastAPI

> FastAPI's rules. The part `presets/python/ruff/fastapi.toml` extends the specs' part with FastAPI's family (`FAST`) and the ban below, and a project that serves with FastAPI extends it, the last link of the chain. A part's `extend-banned-api` replaces the one of the part it extends, so this part repeats the specs' bans beside its own.

### http-exception-banned → program-raises-no-http-exception
`fastapi.HTTPException` and `starlette.exceptions.HTTPException` are banned.

| Why | Tags |
|---|---|
| these are the names a program imports to raise one. | [errors] |
