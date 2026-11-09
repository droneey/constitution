# Layout

> Governs a shell file: its interpreter line and its extension.

## Vocabulary

A **shell script** is a file of shell code, and **`.sh`**{#shell-script} is the extension that marks one.

A **sourced file** is a shell script that other shell code reads with `.` or `source` and never runs on its own.

## Kinds

### executable-script-names-its-shell · MUST

Every executable shell script names its shell on its first line. The line is `#!/usr/bin/env bash`, or `#!/bin/sh` for a script written to POSIX alone.

#### Why

A script run by another shell than its own fails on the first construct that shell lacks, often silently, and `env` finds the Bash the caller's path puts first rather than an older one the system keeps at a fixed path.

#### Examples

```bash title="Avoid"
#!/bin/sh
set -eu

main() {
  local -a invoice_files=(invoices/*.pdf)
  zip invoices.zip "${invoice_files[@]}"
}

main "$@"
```

```bash title="Prefer"
#!/usr/bin/env bash
set -euo pipefail
shopt -s inherit_errexit

main() {
  local -a invoice_files=(invoices/*.pdf)
  zip invoices.zip "${invoice_files[@]}"
}

main "$@"
```

## Names

### shell-file-ends-in-sh → format-has-one-extension · MUST

Every shell script's name ends in `.sh`. Exempt: a file a tool reads only by a fixed name, such as a hook, and a program installed on its users' path under its own name, which is built or linked from a shell script whose name ends in `.sh`.

#### Why

A script with no extension is missed by every glob, linter and reader that looks for scripts, and one in `.bash` is a second spelling every glob has to know, while a program's name is what its users type.

#### Examples

```text title="Avoid"
scripts/
├── release
└── back-up-orders.bash
```

```text title="Prefer"
.githooks/
└── pre-commit
scripts/
├── release.sh
└── back-up-orders.sh
```
