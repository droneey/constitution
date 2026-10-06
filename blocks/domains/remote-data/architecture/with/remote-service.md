# Remote data with a remote service

> Data another system owns, arriving as a stream of its events.

## stream-folded-by-domain-reducer · SHOULD
Events that build an entity are folded by a pure reducer of the domain before they reach the cache.

| Why | Check | Tags |
|---|---|---|
| the fold is tested without a network, and the transport can change without touching it. | review | [data] |

## unauthorized-acted-on-once-by-the-cache → transport-failures-mapped-once
The unauthorized error the shared mapper returns is acted on afterwards, once, by the cache's global error handler.

| Why | Check | Tags |
|---|---|---|
| an unauthorized answer is then handled in one place for every read and write, and no adapter handles it on its own. | review | [] |
