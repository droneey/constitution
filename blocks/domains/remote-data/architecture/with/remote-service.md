# Remote data with a remote service

> Data another system owns, arriving as a stream of its events.

## stream-folded-by-domain-reducer · SHOULD
Events that build an entity are folded by a pure reducer of the domain before they reach the cache.

| Why | Check | Tags |
|---|---|---|
| the fold is tested without a network, and the transport can change without touching it. | review | [data] |
