# uv with package

## version-written-by-uv-version → one-version-for-all-packages
The version command writes the version into every member's `pyproject.toml` with `uv version`; the version is static, never read from a file at build time.

| Why | Check | Tags |
|---|---|---|
| one version across the repository is kept by a command, not by hand, and `uv_build` reads no version from elsewhere. | review | [] |
