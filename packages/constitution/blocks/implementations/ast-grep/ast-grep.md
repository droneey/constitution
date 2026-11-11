---
id: ast-grep
summary: ast-grep checks code of every language by syntax rules.
requires: [task-runner]
languages: [typescript, css, python]
governs: ["sgconfig.yaml", "ast-grep/**"]
---

# ast-grep

> ast-grep, the `ast-grep` command, checks code against rules of its syntax tree, one engine for every language.

`constitution` writes `sgconfig.yaml` and copies the rule of every active block into `ast-grep.gen/`, which `ruleDirs` names; `ast-grep scan` fails on each finding. A rule's `id` is the slug of the rule it holds and its language, `<slug>@<language>`, as `case-named-should-when@typescript`, since a rule of ast-grep reads one language and no two share an `id`; one grammar, Tsx, reads every TypeScript file, with markup or without.
