# Distribution

> Governs when a distributed Python package raises its floor.

## Versions

### requires-python-raised-in-a-minor-or-a-major → runtime-floor-never-raised-in-a-patch · MUST

A published package raises its `requires-python` floor in a minor or a major release, never in a patch.

| Why |
|---|
| an installer skips a release whose `requires-python` the consumer's Python misses, so a consumer on the Python dropped keeps the last minor that supports it, while a patch must reach every consumer of the minor it fixes. |
