# ls-lint with workspace

> The runs that hold the names of a workspace's units.

## each-unit-linted-in-its-folder → unit-checked-by-its-own-parts
In a workspace, the root's run takes the common parts, which reach every unit, and each unit runs ls-lint with `-workdir <its folder>` and the parts of its language and its blocks, named by their path from the root.

| Why | Check | Tags |
|---|---|---|
| a part's keys are paths from the working directory, so a part written for `src/` matches a unit's `src/` only from its folder. | review | [] |
