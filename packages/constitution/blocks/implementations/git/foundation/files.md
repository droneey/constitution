# Files

> Governs the files git ignores, and those it keeps outside its history.

## General

### ignored-file-never-tracked · SHOULD

A file the ignore list covers is not tracked.

| Why |
|---|
| git goes on tracking a file it already tracks whatever the ignore list says, so an ignore rule alone leaves in the history what is already there. |

### lfs-for-files-over-a-megabyte → large-files-outside-history · SHOULD

A file over 1 MB goes to Git LFS, or out of the repository.

| Why |
|---|
| a large file in git's history is downloaded by every clone forever. |
