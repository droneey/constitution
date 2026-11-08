# Effects

> Governs the standard streams of a run, its interrupt, a run that destroys or changes much, the order of its options' sources and its user's files.

## Streams and signals

### standard-output-holds-only-data → shared-resource-has-one-writer · MUST

Every run's standard output carries only its result. Its diagnostics, progress, prompts and failures go to standard error.

| Why |
|---|
| a diagnostic on standard output lands in the pipe or the file the next program reads as data and corrupts it, while on standard error it still reaches the person at the terminal. |

### closed-output-ends-the-run-quietly · SHOULD

When the reader of its standard output closes it early, every run stops with no stack trace. It exits with the code the program's map of exit codes gives a closed pipe.

| Why |
|---|
| a pipeline that reads only the first lines is a normal use, and a trace printed for it reads as a failure of the program. |

### interrupted-run-says-it-is-stopping · SHOULD

On an interrupt, every run says on standard error that it is stopping before it cleans up.

| Why |
|---|
| a person presses Ctrl-C to get the terminal back, and a run that goes silent while it cleans up looks hung, so the person presses again and ends the cleanup half done. |

## Operations

### destructive-run-confirmed-or-forced · MUST

Every run that would destroy what its arguments do not name, or what it cannot restore, goes ahead only once confirmed. Its user confirms it at a prompt. Exempt: a run given `--force`, its confirmation in advance.

| Why |
|---|
| a typo, or an agent running the program unattended, otherwise destroys what nobody meant to — fail-safe defaults. |

### destructive-run-shows-what-it-would-destroy · MUST

Every run that `destructive-run-confirmed-or-forced` holds back for a confirmation prints what it would destroy, before it asks or refuses.

| Why |
|---|
| a person asked to confirm what they cannot see confirms it blind, and one refused without seeing it cannot tell whether `--force` would destroy what they meant. |

### run-that-changes-much-offers-a-dry-run · SHOULD

Every run that changes many things at once, or anything it cannot restore, offers `--dry-run`. Such runs include one over every file a pattern matches and a migration that rewrites every record. Given it, the run shows what it would do and changes nothing.

| Why |
|---|
| a pattern or a flag such as `--all` reaches far more than its user pictured, and a deploy or a migration that destroys nothing it cannot restore, and nothing its arguments do not name, is never held back for a confirmation, so its user learns its reach from the damage, while a script or an agent that must see what an irreversible run would do has no way to ask but to start the run and refuse its confirmation. |

## Configuration

### option-taken-from-flag-then-variable-then-files · MUST

Every option a run can take from several sources ranks its flag first and the system's configuration file last. Between them come its environment variable, then the project's configuration file, then the user's.

| Why |
|---|
| which of a flag, a variable and three files is the narrowest choice is not plain, so without one order a program ranks a file above the variable set for one session, or the user's file above the project's, and a choice made for that session or that project is lost without a word, while a script written against one program's order misreads the next's. |

### user-file-kept-in-the-systems-base-directories · SHOULD

Every file a program keeps for its user lives in the base directory of its kind. Configuration, cache, data and state each have their own: the one `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`, `XDG_DATA_HOME` or `XDG_STATE_HOME` names where it is set to an absolute path, on any system; else, on a Unix-like system, the XDG Base Directory specification's default, whatever folders the system also names; else the known folder the system names. None lives in a dotfile at the root of the home directory.

| Why |
|---|
| people back up, clear and sync these directories by kind, so a cache kept beside configuration is backed up for nothing, configuration kept in a cache is lost when it is cleared and a history kept as data is synced to every machine, while a relative path in an `XDG_*` variable, which the specification calls invalid, puts the files wherever the run happens to start — the XDG Base Directory specification. |
