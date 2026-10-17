# Command line with a config file

> Governs the command that starts a new config file.

## Config file

### init-writes-the-config-file-from-a-template · SHOULD

An `init` command writes one config file from a template, at the path the program reads by default.

| Why | Tags |
|---|---|
| a user starts from a valid config file at the place the program looks, not from a blank page. | [ux] |
