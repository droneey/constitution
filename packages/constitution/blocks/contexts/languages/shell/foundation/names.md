# Names

> Governs the case of shell names.

## Form

### shell-name-case-by-kind → name-case-by-kind · SHOULD

A function and a variable are lower_snake_case; a constant and an environment variable are UPPER_SNAKE_CASE.

| Why |
|---|
| the case alone then tells a value the script owns from one it shares with every process it starts. |
