# Files

> Governs the files git keeps outside its history.

## General

### lfs-for-files-over-a-megabyte → large-files-outside-history · SHOULD

A file over 1 MB goes to Git LFS, or out of the repository.

| Why |
|---|
| a large file in git's history is downloaded by every clone forever. |
