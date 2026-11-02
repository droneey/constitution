# Secrets

> Governs the file's secrets and the references that stand for them.

## General

### config-file-secret-written-as-a-reference · MUST

A secret in the config file is written as a reference by name, never as its value. The reference points to the environment, to a file its host mounts, or to a secret store the program reads.

| Why |
|---|
| a secret written as its value leaks wherever the file goes (a commit, a message, a review) so the file can no longer be shared. |

### config-file-reference-resolved-on-read → configuration-enters-only-through-its-declaration · MUST

Every reference the config file makes is resolved when the file is read. A read with references missing fails naming every one of them, not the first alone.

| Why |
|---|
| a reference resolved at its first use fails mid-run after part of the work is done, and a failure that names one missing reference at a time takes a run per reference to fix — fail fast. |
