# Vite

## build-is-not-the-type-gate · MUST
The build does not check types: the check runs the compiler before the build.
**Why:** the build strips types without reading them, so a green build proves nothing about them.
**Check:** review
**Tags:** types, process
**Implements:** `compiler-is-the-type-gate`

## vite-public-env-holds-no-secret · MUST
Only variables with the public prefix reach the bundle, and each of them is public: none holds a secret.
**Why:** whatever reaches the bundle is readable by every user.
**Check:** review
**Tags:** security
**Implements:** `secret-never-in-url-or-artefact`

## bundle-measured-against-budget · SHOULD
The build's output is measured against the bundle's size budget in the check, entry by entry.
**Why:** the budget holds only if every build is measured against it.
**Check:** review
**Tags:** performance
**Implements:** `bundle-size-budget`
