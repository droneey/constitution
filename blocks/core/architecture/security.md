# Security

## Secrets

## environment-names-declared-in-one-place · SHOULD
Every environment variable the program reads is declared in one place, and code reads only declared names.

| Why | Check | Tags |
|---|---|---|
| one declaration shows what a deployment must provide, and no module reads a name nobody knows it needs. | review | [security] |
