# Names

> Governs a name in a script: its case.

## Form

### shell-name-case-by-kind → name-case-by-kind · SHOULD

Each kind of shell name takes one case. A function and a variable are lower_snake_case; a constant and an environment variable are UPPER_SNAKE_CASE.

| Why |
|---|
| a script's own variable in upper case reads as one it shares with every process it starts, and can overwrite an environment variable of the same name unseen. |
