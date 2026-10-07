# User interface with remote data

> Governs where a write invalidates what it changed.

## Writes

### write-invalidates-in-its-binding-unit · SHOULD
After a write, the write's binding unit says what to reload, through the feature's key factory.

| Why | Tags |
|---|---|
| the one place that knows what a write changed is the one that says what to reload. | [data] |
