# Files

> Governs which files git keeps outside its history.

## General

### large-files-kept-in-lfs → large-files-outside-history · SHOULD

Every large binary file is tracked by Git LFS, so the repository history keeps only its pointer. Exempt: a file kept out of the repository altogether.

| Why |
|---|
| a large file committed as itself is downloaded by every clone for ever, while Git LFS fetches only the versions a checkout needs. |
