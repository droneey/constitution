# Runtimes

> Governs the runtimes a unit supports: the floor it declares and the runtimes it is checked on.

## Floor

### manifest-declares-the-runtime-floor · MUST

The manifest declares the lowest version of its language's runtime the unit supports.

| Why |
|---|
| a consumer on an older runtime then fails at install with a clear reason, not at run time on a feature the runtime lacks. |

### runtime-floor-within-the-ecosystems-support-window · SHOULD

A unit published for others floors its runtime no lower than the oldest release line the runtime's maintainers still support, unless its language's block names a narrower window.

| Why |
|---|
| a floor below what the runtime's maintainers support holds back every dependency the unit shares with its consumers, and keeps it running where no security fix arrives. |

## Checks

### unit-checked-on-every-runtime-it-supports · MUST

A unit published for others is checked on its floor's release line and on each later line of its runtime that the runtime's maintainers still support, up to the newest stable one.

| Why |
|---|
| a unit that claims a runtime it was never run on breaks its consumers there first. |
