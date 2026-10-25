# Shared files

> Governs a file or data that several units need.

## General

### file-lives-once-across-units → fact-has-one-source · MUST

A file several packages need lives once in the repository; a package that needs it at run time takes it from there in its build, and no copy of it is committed.

| Why |
|---|
| one source means a fix is made once and reaches every unit, and a committed copy becomes a second original that drifts from the one reviewed. |

### shared-data-parsed-by-each-reader → outside-value-untyped-until-parsed · MUST

Data in no language that several packages read — a schema, a table of cases — is parsed by each package that reads it, at its edge.

| Why |
|---|
| a reader that trusts the shape of a file it does not own breaks unseen when the file changes. |
