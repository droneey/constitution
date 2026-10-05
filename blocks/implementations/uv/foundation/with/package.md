# uv with package

> A repository of Python packages as a uv workspace.

## members-linked-by-workspace-source → workspace-packages-linked-locally
The root's `[tool.uv.workspace]` lists the members, and a member that depends on another names it in `[tool.uv.sources]` with `{ workspace = true }`.

| Why | Check | Tags |
|---|---|---|
| the workspace then installs each member from the working tree, and resolves one version of every dependency for all of them. | review | [] |

## uv-build-backend-capped · SHOULD
A package builds with `uv_build`, required in `[build-system]` with a floor and a cap below the next minor: `uv_build>=0.12,<0.13`.

| Why | Check | Tags |
|---|---|---|
| a new minor of the backend may build a different package from the same files; the cap makes that an update someone reviews. | review | [] |

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
