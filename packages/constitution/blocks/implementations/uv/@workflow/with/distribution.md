# Distribution

> Governs the attestation uv uploads beside a distribution it publishes.

## General

### distribution-uploaded-with-its-attestation → version-published-with-provenance · MUST

Every distribution uv uploads carries an attestation made under the identity of the run that publishes it.

| Why |
|---|
| `uv publish` uploads the attestations it finds beside the distributions but makes none, so a distribution without one is published with no provenance. |
