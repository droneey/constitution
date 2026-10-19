# Secrets

> Governs the file's secrets and the references that stand for them.

## General

### config-file-secret-written-as-a-reference · MUST

A secret in the config file is written as a reference by name — to the environment, to a file its host mounts, or to a secret store the program reads — never as its value.

| Why | Tags |
|---|---|
| the config file can then be committed, shared and reviewed without leaking what it needs. | [security] |

### config-file-reference-resolved-on-read → configuration-parsed-once-at-start · MUST

Every reference the config file makes is resolved when the config file is read — from the environment, the local environment file beside the config file, a file its host mounts, or the secret store it names — and the read fails naming every one that is missing; a secret its host rotates is resolved again through the same reference.

| Why | Tags |
|---|---|
| a missing secret then fails before anything is done, with the full list of what to set. | [security, errors] |
