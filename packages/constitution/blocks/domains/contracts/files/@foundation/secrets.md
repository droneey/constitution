# Secrets

> Governs the config file's secrets and the secret references that stand for them.

## Vocabulary

A config file's **secret reference** is the name it writes in a secret's place. What a secret reference resolves to is part of the run's input, as the config file is, and no setting the program declares for itself.

## General

### config-file-secret-written-as-a-reference · MUST

Every secret in the config file is written as a secret reference, never as its value. The secret reference points to an environment variable, to a file its host mounts, or to a secret store the program reads.

| Why |
|---|
| a secret written as its value leaks wherever the file goes (a commit, a message, a review) so the file can no longer be shared. |

### config-file-reference-resolved-on-read · SHOULD

Every secret reference the config file makes is resolved when the file is read, never at its first use.

| Why |
|---|
| a secret reference resolved at its first use fails mid-run after part of the work is done — fail fast. |

### missing-references-all-named-in-the-failure → parse-failure-lists-every-problem · SHOULD

Every read of the config file that finds secret references missing fails naming every one of them, never the first alone.

| Why |
|---|
| a failure that names one missing secret reference at a time takes a run per secret reference to fix. |
