# Security

## Secrets

## environment-names-declared-in-one-place · SHOULD
Every environment variable the program reads is declared in one place, and code reads only declared names.

| Why | Check | Tags |
|---|---|---|
| one declaration shows what a deployment must provide, and no module reads a name nobody knows it needs. | review | [security] |

## Operations and access

## entry-point-declares-its-access → access-denied-unless-granted
Every entry point declares its access where it is defined, at the boundary.

| Why | Check | Tags |
|---|---|---|
| access declared beside the entry point is read and reviewed with it, and an entry point without a declaration stands out. | review | [] |
