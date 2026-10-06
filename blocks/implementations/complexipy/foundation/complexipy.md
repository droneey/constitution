# complexipy

### cognitive-complexity-held-at-ten → function-file-and-complexity-limits
complexipy fails on a function whose cognitive complexity passes 10, with `max-complexity-allowed = 10`, and no snapshot of the functions over the limit is kept to let them pass.

| Why | Tags |
|---|---|
| the linter measures only the cyclomatic complexity, which counts branches and not how deep they nest. | [] |
