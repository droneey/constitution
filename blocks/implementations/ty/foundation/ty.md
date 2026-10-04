# ty

## ty-is-the-type-gate → rules-held-by-tools
`ty check` runs in the check with every rule an error, and a warning fails the run.

| Why | Check | Tags |
|---|---|---|
| a rule left at a warning or off is a rule the type checker sees broken and lets pass. | tool/types | [] |

## ty-ignore-names-its-rule → suppression-names-its-code-and-reason
A `# ty: ignore` names its rule and silences a finding the check would report, and a `# type: ignore` silences nothing.

| Why | Check | Tags |
|---|---|---|
| a blanket suppression silences rules nobody meant to, one that silences nothing outlives its finding, and a comment of no tool of the project's can be judged by none. | tool/types | [] |

## deprecated-calls-fail-the-types → deprecated-forms-never-used
A use of anything marked `@deprecated` fails the type check as `deprecated`, which the part makes an error.

| Why | Check | Tags |
|---|---|---|
| ty reports a deprecated use only as a warning unless its rule is an error. | tool/types | [] |
