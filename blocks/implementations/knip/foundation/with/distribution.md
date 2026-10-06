# knip with distribution

> A distributed package whose integration imports an optional peer.

### optional-peer-ignored-in-production → production-set-marked-in-the-entries
The framework an integration imports as an optional peer is listed in `ignoreDependencies` with `!`, `'<framework>!'`, in the configuration of the package that offers the integration.

| Why | Tags |
|---|---|
| knip 6.38's production run counts only `dependencies` and the required peers, so it reports the integration's import as unlisted; the `!` form drops that report from the production run alone, and the default run still finds the development copy and the peer. | [] |
