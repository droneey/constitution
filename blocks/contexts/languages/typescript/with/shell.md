# TypeScript with shell

> Governs the shell commands a package's scripts hold.

## Code

### package-script-kept-short · SHOULD
A script of `package.json` is kept within the number of commands the project sets, quoted as a shell script is; anything longer is a `.sh` file the script runs.

| Why | Tags |
|---|---|
| a command held in a manifest is read by no shell linter, so what grows there grows unchecked. | [] |
