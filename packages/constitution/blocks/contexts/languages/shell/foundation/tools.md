# Tools

> Governs the analyser a script passes.

## General

### script-passes-a-shell-analyser → rule-held-by-a-tool-where-one-can · MUST

Every script, and every shell command another file holds, passes a static analyser of shell — one that knows its quoting, its word splitting and the pitfalls of errexit — at its strictest severity.

| Why | Tags |
|---|---|
| most rules of this block — quoting, raw reads, a declaration apart from its substitution — are findings such an analyser reports, and a command embedded in another file otherwise grows unchecked. | [errors, security] |
