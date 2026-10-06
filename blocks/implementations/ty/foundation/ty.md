# ty

### ty-is-the-type-gate → rules-held-by-tools
ty's configuration makes every rule an error and fails on a warning.

| Why | Tags |
|---|---|
| a rule left at a warning or off is a rule the type checker sees broken and lets pass. | [] |

### ty-ignore-names-its-rule → suppression-silences-one-finding
A `# ty: ignore` names its rule and silences a finding ty would report, and a `# type: ignore` silences nothing.

| Why | Tags |
|---|---|
| a blanket suppression silences rules nobody meant to, one that silences nothing outlives its finding, and a comment of no tool of the project's can be judged by none. | [] |

### deprecated-calls-fail-the-types → deprecated-forms-never-used
A use of anything marked `@deprecated` fails the type check as `deprecated`, which the part makes an error.

| Why | Tags |
|---|---|
| ty reports a deprecated use only as a warning unless its rule is an error. | [] |
