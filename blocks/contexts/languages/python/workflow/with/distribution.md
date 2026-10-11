# Python with distribution

> Governs when a distributed Python package raises its floor.

## Releases

### requires-python-raised-in-a-minor → runtime-floor-raised-only-in-a-minor · MUST
A published package raises its `requires-python` floor only in a minor release, never in a patch.

| Why | Tags |
|---|---|
| a consumer on the Python dropped keeps the last minor that supports it, and a patch must reach every consumer of the minor it fixes. | [] |
