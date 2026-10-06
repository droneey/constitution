# Ruff

## ruff-format-is-the-formatter → code-formatted-by-one-formatter
Ruff formats every Python file: two spaces, single quotes, docstrings in double quotes, lines of at most 100.

| Why | Check | Tags |
|---|---|---|
| one formatter for Python ends every argument about its layout. | tool/format | [] |

## rule-families-selected-by-name · MUST
The rules are selected by family or code, never with `ALL`.

| Why | Check | Tags |
|---|---|---|
| `ALL` turns on every rule a new release adds, so an update fails the check with rules nobody chose, some of which contradict others. | review | [] |

## preview-rules-only-by-code · SHOULD
A preview rule is selected only by its exact code, with `explicit-preview-rules = true`, never through a family.

| Why | Check | Tags |
|---|---|---|
| a family in preview grows with each release; a code names one rule someone read. | review | [] |

## noqa-names-its-codes → suppression-silences-one-finding
A `# noqa` names its codes and silences a finding Ruff would report.

| Why | Check | Tags |
|---|---|---|
| a blanket suppression silences rules nobody meant to, and one that silences nothing stays after the finding it was for is gone. | tool/lint | [] |
