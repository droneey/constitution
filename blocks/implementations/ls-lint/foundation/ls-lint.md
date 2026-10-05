# ls-lint

## ls-lint-config-ends-in-yaml → yaml-files-end-in-yaml
The configuration is `.ls-lint.yaml`, passed with `--config`.

| Why | Check | Tags |
|---|---|---|
| the default name ends in the spelling the constitution forbids. | tool/names | [] |

## each-application-linted-in-its-folder → application-checked-from-its-own-folder
In a repository of several applications, the root's run takes the common parts, which reach every package, and each application runs ls-lint with `-workdir <its folder>` and the parts of its language and its blocks, named by their path from the root.

| Why | Check | Tags |
|---|---|---|
| a part's keys are paths from the working directory, so a part written for `src/` matches an application's `src/` only from its folder. | review | [] |
