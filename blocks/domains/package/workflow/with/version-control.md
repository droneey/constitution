# Package with version control

> Releases of packages cut from tags, with changelogs read from the history.

## one-tag-publishes-every-package · SHOULD
One tag publishes every public package.

| Why | Check | Tags |
|---|---|---|
| a release is then one act that ships the packages together, never a set of packages published one at a time. | review | [] |

## changelog-from-commit-subjects · SHOULD
The changelog of a release is the commit subjects since the previous tag, `feat` and `fix` subjects first.

| Why | Check | Tags |
|---|---|---|
| a changelog written from the history is complete by construction, and costs nothing to keep. | review | [] |
