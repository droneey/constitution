# Syncpack

## versions-checked-and-manifests-formatted · MUST
The check runs `syncpack lint` and `syncpack format --check`.
**Why:** the first holds one version per dependency, the second the shared order of fields; both only read.
**Check:** tool — versions
**Tags:** process
**Implements:** `one-version-per-dependency`
