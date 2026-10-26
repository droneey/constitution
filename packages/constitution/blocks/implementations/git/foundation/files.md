# Files

> Governs which files git ignores and which it keeps outside its history.

## General

### gitignore-covers-key-files → secret-never-in-the-repository · MUST

`.gitignore` covers key and credential files — `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `credentials.json`, `id_rsa`, `*.secrets` — in nested ignore files too.

| Why |
|---|
| one careless add of a key file publishes it; the ignore rule stops it before the scanner has to. |

### gitignore-covers-environment-files → machine-local-files-ignored · MUST

`.gitignore` covers every local environment file except its example — `.env*` but `.env.example` — in nested ignore files too.

| Why |
|---|
| a local environment file holds one machine's settings and often its secrets, and one careless add commits them. |

### gitignore-covers-dependencies-output-and-caches · SHOULD

`.gitignore` covers dependencies, build output, coverage, logs, caches, temporary and backup files, and the files of the operating system and of personal editors. A file it covers is not tracked.

| Why |
|---|
| what the build or the machine produces never belongs in history, and an ignore rule alone leaves tracked what is already there. |

### lfs-for-files-over-a-megabyte → large-files-outside-history · SHOULD

A file over 1 MB goes to Git LFS, or out of the repository.

| Why |
|---|
| a large file in git's history is downloaded by every clone forever. |
