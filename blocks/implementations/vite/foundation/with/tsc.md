# Vite with tsc

## build-is-not-the-type-gate → compiler-is-the-type-gate
The build does not check types: the check runs the compiler before the build.

| Why | Check | Tags |
|---|---|---|
| the build strips types without reading them, so a green build proves nothing about them. | review | [] |
