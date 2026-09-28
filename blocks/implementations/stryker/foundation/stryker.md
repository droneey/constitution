# Stryker

## equivalent-mutant-marked-on-its-line → mutants-all-killed
An equivalent mutant is marked on its line — `// Stryker disable next-line <mutator>: <reason>` — one mutator and its reason; never `all`, and never a disable for a whole file.

| Why | Check | Tags |
|---|---|---|
| a mark on one line for one mutator is an argument a reviewer can check; a broad one hides real survivors. | review | [] |
