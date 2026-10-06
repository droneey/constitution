# Python with distribution

> How a distributed Python package's versions follow its floor.

### requires-python-raised-in-a-minor → versions-follow-semver
A published package raises its `requires-python` floor only in a minor release, never in a patch.

| Why | Tags |
|---|---|
| a consumer on the Python dropped keeps the last minor that supports it, and a patch must reach every consumer of the minor it fixes. | [] |
