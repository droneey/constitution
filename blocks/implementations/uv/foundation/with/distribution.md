# uv with distribution

> How uv publishes a distributed Python package and runs its specs from its floor.

## distributions-attested-before-upload → publishing-by-workflow-identity
The job that publishes signs each distribution with `pypi-attestations sign`, under the run's identity, which writes `<file>.publish.attestation` beside it, and `uv publish` uploads the two together.

| Why | Check | Tags |
|---|---|---|
| `uv publish` uploads the attestations it finds but makes none, so without this step a package is published with no provenance. | review | [security] |

## lowest-direct-run-isolated → specs-run-from-the-floor-to-the-newest
The run on the floor is `uv run --isolated --python <floor> --resolution lowest-direct` before the spec command, and each other run passes its minor to `--python`.

| Why | Check | Tags |
|---|---|---|
| without `--isolated`, `--resolution lowest-direct` resolves the project again and rewrites `uv.lock`, which `--locked` then refuses. | review | [testing] |
