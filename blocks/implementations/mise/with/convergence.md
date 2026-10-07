# mise with convergence

> The engines a convergence program installs, on the PATH.

### tool-engines-on-path-through-mise → tools-reach-the-programs-engines · SHOULD
`[env] _.path` in `mise.toml` puts the program's engine directory on the PATH of the repository's toolchain; engine versions live in the program, not in `mise.toml`.

| Why | Tags |
|---|---|
| every tool reaches the engines the program installed, and their versions are pinned in one place. | [] |
