# Distribution

> Governs the attestation uv uploads beside a distribution it publishes.

## General

### distribution-uploaded-with-its-attestation → version-published-with-provenance · MUST

Every distribution uv uploads carries an attestation made under the identity of the run that publishes it.

#### Why

`uv publish` uploads the attestations it finds beside the distributions but makes none, so a distribution without one is published with no provenance.

#### Examples

```yaml title="Avoid"
publish:
  runs-on: ubuntu-24.04
  permissions:
    id-token: write
  steps:
    - uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
      with:
        name: dist
        path: dist/
    - run: uv publish
```

```yaml title="Prefer"
publish:
  runs-on: ubuntu-24.04
  permissions:
    id-token: write
  steps:
    - uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
      with:
        name: dist
        path: dist/
    - uses: astral-sh/attest-action@39b6ce43875c196a579e31635b11aa2a2036384a # v0.0.7
    - run: uv publish
```
