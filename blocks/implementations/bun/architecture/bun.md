# Bun

## Running

## no-automatic-env-file · SHOULD
Bun's automatic loading of the local environment file is off — `--no-env-file` in the entry's shebang and in the scripts — so the program reads its environment only where the configuration is parsed.
**Why:** a file loaded behind the program's back sets values nobody declared, and hides a missing one.
**Check:** review
**Tags:** security
**Implements:** `environment-read-once-at-boot`
