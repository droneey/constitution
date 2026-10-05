# Bun with distribution

> How a Bun repository uses the configuration it distributes.

## own-configuration-as-workspace-dependency → root-dogfoods-its-configuration
The root installs the configuration packages the repository distributes as `workspace:*` development dependencies.

| Why | Check | Tags |
|---|---|---|
| the root then uses each package as a consumer does, from the working tree. | review | [] |
