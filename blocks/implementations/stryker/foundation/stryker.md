# Stryker

## equivalent-mutant-marked-on-its-line → suppression-silences-one-finding
An equivalent mutant is marked `// Stryker disable next-line <mutator>: <reason>`; never `all`.

| Why | Check | Tags |
|---|---|---|
| a disable without `next-line` holds to the end of the file, and `all` silences every mutator. | review | [] |
