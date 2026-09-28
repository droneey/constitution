# mise with convergence

> The engines a convergence program installs, on the PATH.

## tool-engines-on-path-through-mise → developer-and-ci-run-the-tools-engines
`[env] _.path` in `mise.toml` puts the program's engine directory on the PATH for developers and CI; engine versions live in the program, not in `mise.toml`.

| Why | Check | Tags |
|---|---|---|
| everyone runs the engines the program installed, and their versions are pinned in one place. | review | [] |
