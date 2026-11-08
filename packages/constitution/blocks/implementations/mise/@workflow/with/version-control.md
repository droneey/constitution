# Version control

> Governs how the commit hooks are installed.

## Hooks

### distribution-hook-installs-the-commit-hooks → hooks-installed-on-setup · SHOULD

The `postinstall` hook of the shared-configuration distribution also installs the commit hooks.

| Why |
|---|
| hooks installed by a step of their own are missing wherever that step is forgotten, while the configuration they belong to is installed in every repository that uses it. |
