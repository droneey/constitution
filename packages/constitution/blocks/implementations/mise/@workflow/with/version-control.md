# Version control

> Governs how the commit hooks are installed.

## Hooks

### distribution-hook-installs-the-commit-hooks → hooks-installed-on-setup · SHOULD

The `postinstall` hook of the shared-configuration distribution also installs the commit hooks.

#### Why

Hooks installed by a step of their own are missing wherever that step is forgotten, while the configuration they belong to is installed in every repository that uses it.

#### Examples

```toml title="Avoid"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[tools."github:shop/presets"]
version = "3.2.0"
asset_pattern = "presets-3.2.0.tar.gz"
strip_components = 0
postinstall = 'ln -sfn "$MISE_TOOL_INSTALL_PATH" .presets'
```

```toml title="Prefer"
#:schema https://mise.jdx.dev/schema/mise.json
# mise.toml
[tools."github:shop/presets"]
version = "3.2.0"
asset_pattern = "presets-3.2.0.tar.gz"
strip_components = 0
postinstall = 'ln -sfn "$MISE_TOOL_INSTALL_PATH" .presets && lefthook install'
```
