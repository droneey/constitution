# yaml-js

### yaml-home-is-the-parsing-adapter-and-lib → layer-imports-dependencies-by-its-role · MUST

The `yaml` package's home is the adapters that parse YAML and the lib under `libs/` that wraps it; no other folder imports it.

| Why | Tags |
|---|---|
| a parser in the domain ties the business rules to a file format, and its untyped result must not travel inward. | [] |
