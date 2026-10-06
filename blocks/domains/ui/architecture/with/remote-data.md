# User interface with remote data

> Screens that show and change data another system owns: the cache the providers build, and what a write reloads.

### cache-client-built-by-the-providers · MUST
The providers also build the cache client and hand it to the binding units.

| Why | Tags |
|---|---|
| every binding unit then reads and writes the one cache the composition root chose, and a spec hands them another. | [data] |

### command-invalidates-in-its-binding-unit · SHOULD
After a write, invalidation happens in the command's binding unit, through the feature's key factory.

| Why | Tags |
|---|---|
| the one place that knows what a write changed is the one that says what to reload. | [data] |
