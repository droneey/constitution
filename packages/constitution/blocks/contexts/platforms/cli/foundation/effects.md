# Effects

> Governs the standard streams, interrupts, destructive commands, settings and user files.

## Streams and signals

### standard-output-holds-only-data → shared-resource-has-one-writer · MUST

Standard output carries only the command's result. Diagnostics, progress, prompts and failures go to standard error.

| Why |
|---|
| a diagnostic on standard output lands in the pipe or the file the next program reads as data and corrupts it, while on standard error it still reaches the person at the terminal. |

### closed-output-ends-the-run-quietly · SHOULD

A closed output ends the run quietly. When the reader of standard output closes it, as `head` does, the command stops without a stack trace and exits as a program ended by `SIGPIPE`.

| Why |
|---|
| a pipeline that reads only the first lines is a normal use, and a trace printed for it reads as a failure of the command. |

### interrupt-ends-the-run-promptly → program-stops-cleanly · MUST

An interrupt ends the run promptly. On an interrupt a command says it is stopping, cleans up within a bound and exits as interrupted; a second interrupt ends it without the cleanup.

| Why |
|---|
| a person presses Ctrl-C to get the terminal back, and a command that ignores it, or hangs in its cleanup, holds the terminal and whatever it locked. |

## Operations

### destructive-command-confirmed-or-forced → irreversible-operation-runs-dry-by-default · MUST

A destructive command runs only when confirmed or forced. A command that destroys more than its arguments name, or what it cannot restore, asks for confirmation on a terminal; without one it refuses with a usage error unless `--force` is given, and it offers `--dry-run`.

| Why |
|---|
| a typo, or an agent running the command unattended, otherwise destroys what nobody meant to, and no prompt can be answered where no terminal is — fail-safe defaults. |

## Configuration

### setting-taken-from-flag-then-environment-then-files · SHOULD

A setting given in several places is taken from its most specific source. The flag comes first, then the environment, then the project's configuration file, then the user's, then the system's.

| Why |
|---|
| in any other order a broader choice outranks a narrower one, so a user cannot override a file for one run, nor a project a user's defaults, without editing the file. |

### user-file-kept-in-the-systems-base-directories · SHOULD

A program keeps its user's files in the system's base directory of each kind. Configuration, cache and data live in `XDG_CONFIG_HOME`, `XDG_CACHE_HOME` and `XDG_DATA_HOME` with their defaults on Linux and macOS, the known folders on Windows, and a set `XDG_*` variable on every system — never in a dotfile at the root of the home directory.

| Why |
|---|
| people back up, clear and sync these directories by kind, so a cache kept beside configuration is backed up for nothing, and configuration kept in a cache is lost when it is cleared — the XDG Base Directory specification. |
