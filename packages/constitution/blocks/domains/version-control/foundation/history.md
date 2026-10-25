# History

> Governs shared history and the tags that mark releases.

## General

### shared-history-never-rewritten · MUST

History others have fetched is never rewritten or deleted, the main line's least of all.

| Why |
|---|
| a rewritten shared history breaks every copy built on it and can lose others' work. |

### secret-in-history-counts-as-leaked → leaked-secret-rotated-at-once · MUST

A secret that reached any commit has leaked, even when a later commit removed it, and is rotated; rewriting the history does not undo the leak.

| Why |
|---|
| every clone made before the removal or the rewrite still holds the secret, and the rewrite only hides that it leaked. |

### release-marked-by-immutable-tag · MUST

A release is marked by a tag of its version on the commit it was built from, and the tag is never moved, deleted or reused.

| Why |
|---|
| a version must always name the same code, and a tag that can be moved or made again lets whoever controls it swap the code under everyone who uses that version. |

### release-tag-signed · SHOULD

A release tag is signed by its release's identity.

| Why |
|---|
| a signed tag proves which identity released the code, and an attacker who can push a tag cannot forge the signature. |
