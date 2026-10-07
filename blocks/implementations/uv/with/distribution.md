# uv with distribution

> What uv packs into a distributed Python package, and the attestation it uploads beside it.

### files-shipped-named-in-pyproject → ships-only-the-files-it-names · MUST
A distributed package names in `pyproject.toml` what it ships beyond its code: `uv_build` packs the import package's folder whole, so `source-exclude` under `[tool.uv.build-backend]` leaves out each file of that folder that does not ship, `source-include` adds a file from outside it, and `license-files` under `[project]` names the licence.

| Why | Tags |
|---|---|
| `uv_build` puts every file of the import package's folder into the source distribution and the wheel alike, a local configuration left there included, and ships the licence only when `license-files` names it. | [] |

### distribution-uploaded-with-its-attestation → publishing-by-workflow-identity · MUST
Every distribution uv uploads carries an attestation made under the identity of the run that publishes it.

| Why | Tags |
|---|---|
| `uv publish` uploads the attestations it finds beside the distributions but makes none, so a distribution without one is published with no provenance. | [security] |
