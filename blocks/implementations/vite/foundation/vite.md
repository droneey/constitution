# Vite

## build-is-not-the-type-gate → compiler-is-the-type-gate
The build does not check types: the check runs the compiler before the build.

| Why | Check | Tags |
|---|---|---|
| the build strips types without reading them, so a green build proves nothing about them. | review | [] |

## vite-public-env-holds-no-secret → secret-never-in-url-or-artefact
Only variables with the public prefix reach the bundle, and each of them is public: none holds a secret.

| Why | Check | Tags |
|---|---|---|
| whatever reaches the bundle is readable by every user. | review | [] |

## bundle-measured-against-budget → bundle-size-budget
The build's output is measured against the bundle's size budget in the check, entry by entry.

| Why | Check | Tags |
|---|---|---|
| the budget holds only if every build is measured against it. | review | [] |
