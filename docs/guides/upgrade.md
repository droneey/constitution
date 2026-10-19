# Upgrade

> A project moves to a new release when it raises its pin; the plugin follows the release the project pins.

## Raise the pin

1. Set the new version in `mise.toml`.
2. Refresh the lockfile and install, which links the new release into `.droneey/constitution/`:

   ```bash
   mise lock
   mise install
   ```

3. Start a new session and read the digest's warnings: a block renamed or split, a key the release reads differently, an override whose rule is gone.
4. Run the project's check. A new rule the code breaks is fixed in the code, or, with a reason, [overridden](override-a-rule.md).

The release notes, on GitHub's releases page, name what each release adds, changes and removes.

## Keep the plugin current

The plugin reads the form of the blocks its own release writes and the one before it. When a project pins a release whose form it cannot read, the digest holds only what to do:

| The digest says | Because | Do |
|---|---|---|
| raise the Constitution pin in this project | the project's release is older than the plugin reads | raise the pin, as above |
| `claude plugin marketplace update droneey`, then `claude plugin update constitution@droneey` | the project's release is newer than the plugin | update the plugin, then start a new session |
| run `mise install` | `.droneey/constitution/` is missing, as in a fresh clone | install it |

The marketplace serves only released versions, never unreleased work.
