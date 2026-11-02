# Files

> Governs which files git ignores and which it keeps outside its history.

## General

### gitignore-covers-environment-files → machine-local-files-ignored · MUST

`.gitignore` covers every local environment file but its example, in nested ignore files too.

| Why |
|---|
| a local environment file holds one machine's settings and often its secrets, and one careless add commits them. |

### lfs-for-files-over-a-megabyte → large-files-outside-history · SHOULD

A file over 1 MB goes to Git LFS, or out of the repository.

| Why |
|---|
| a large file in git's history is downloaded by every clone forever. |
