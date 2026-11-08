# History

> Governs shared repository history and what it may never hold.

## Vocabulary

The **repository history** is the record of the repository's version-control commits that its clones share, a **version-control commit** being one recorded change of the repository's files.

A **clone** is a copy of the repository that holds the whole repository history.

A **version-control branch** is a named line of version-control commits, and the **main line** is the version-control branch the project builds and ships from, which every change reaches last.

## General

### shared-history-never-rewritten · MUST

No repository history others have fetched is rewritten or deleted.

| Why |
|---|
| a rewritten shared repository history breaks every copy built on it and can lose others' work. |

### secret-in-history-counts-as-leaked → leaked-secret-rotated-at-once · MUST

Every secret that reached a version-control commit has leaked. It stays leaked once a later version-control commit removes it or the repository history is rewritten.

| Why |
|---|
| every clone made before the removal or the rewrite still holds the secret, and the rewrite only hides that it leaked. |
