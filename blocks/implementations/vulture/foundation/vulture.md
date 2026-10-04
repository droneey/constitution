# vulture

## unused-code-reported-from-sixty → no-dead-code
`vulture` fails on a definition or import that nothing in `src/` uses, at a confidence of 60 or more.

| Why | Check | Tags |
|---|---|---|
| vulture rates an unused function or class at 60, so at 80 it reports none, and code kept alive only by its specs is dead in production. | tool/unused | [] |

## ignored-names-state-their-reasons → suppression-states-its-reason
A name only a framework or an entry reaches — a route, a tool function, a console script — is listed in `ignore_names` or `ignore_decorators` of `[tool.vulture]`, each with its reason in a comment beside it.

| Why | Check | Tags |
|---|---|---|
| these lists are where vulture is silenced, so each entry must say why the name is in use. | review | [] |
