# Linters

> Governs the linters of Dockerfiles and Compose files.

## General

### docker-files-linted-in-the-check · MUST

Every Dockerfile, the scripts of its `RUN` steps included, and every Compose file of the repository is held by a linter, and any finding is a violation.

| Why | Tags |
|---|---|
| a file no linter reads is held by nothing, and a warning that passes is one nobody fixes. | [] |
