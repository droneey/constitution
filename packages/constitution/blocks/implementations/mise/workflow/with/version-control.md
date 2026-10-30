# Version control

> Governs how the commit hooks are installed.

## Hooks

### distribution-hook-installs-the-commit-hooks → hooks-installed-on-setup · SHOULD

The `postinstall` hook of the shared configuration's distribution also installs the commit hooks.

| Why |
|---|
| the hooks then arrive with the configuration they belong to, in a repository of any language. |
