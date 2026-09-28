# Syncpack

## versions-checked-and-manifests-formatted · SHOULD
The check runs `syncpack lint` and `syncpack format --check`.
**Why:** the first holds one version per dependency, the second the shared order of fields; both only read.
**Check:** tool — versions
**Tags:** workflow
**Implements:** `one-version-per-dependency`
