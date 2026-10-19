# Config file

> Governs a config file written in YAML.

## Schema

### config-file-header-names-its-schema → config-file-points-editors-at-the-schema · SHOULD

The config file's first line is `# yaml-language-server: $schema=<published schema URL>`.

| Why | Tags |
|---|---|
| editors then check and complete the config file against the program's own schema. | [] |
