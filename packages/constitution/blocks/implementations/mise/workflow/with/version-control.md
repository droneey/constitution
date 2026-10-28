# Version control

> Governs how the commit hooks are installed.

## Hooks

### distribution-hook-installs-the-commit-hooks · SHOULD

The `postinstall` hook of the shared configuration's distribution also installs the commit hooks, never a package manager's install script.

| Why |
|---|
| the hooks then arrive with the configuration they belong to, in a repository of any language, and no dependency's install script runs to set them up. |
