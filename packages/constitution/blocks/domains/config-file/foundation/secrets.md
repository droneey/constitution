# Secrets

> Governs the file's secrets and the references that stand for them.

## General

### config-file-secret-written-as-a-reference · MUST

A secret in the config file is written as a reference by name — to the environment, to a file its host mounts, or to a secret store the program reads — never as its value.

| Why |
|---|
| the config file can then be committed, shared and reviewed without leaking what it needs. |

### config-file-reference-resolved-on-read → configuration-parsed-once-at-start · MUST

Every reference the config file makes is resolved when the file is read, and a read with references missing fails naming every one of them, not the first alone.

| Why |
|---|
| a missing secret then fails before anything is done, with the full list of what to set. |
