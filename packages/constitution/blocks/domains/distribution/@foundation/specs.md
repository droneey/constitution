# Specs

> Governs how a configuration a distributed package ships is proven.

## General

### shipped-configuration-asserted-by-spec → constant-others-rely-on-pinned-by-a-table · SHOULD

Every configuration a distributed package ships has its settings asserted by one table in a spec that parses the configuration.

| Why |
|---|
| a configuration has no behaviour to call, so one whose settings no spec asserts can say other than it means and pass every check. |

### shipped-configuration-loaded-by-its-real-tool · SHOULD

Every configuration a distributed package ships is loaded once in a spec by the real tool it configures. That load proves the tool accepts it.

| Why |
|---|
| a table of settings proves what the configuration says, not that its tool reads it, so a key the tool renamed or a plugin it cannot find ships a configuration that fails on every consumer's first run. |
