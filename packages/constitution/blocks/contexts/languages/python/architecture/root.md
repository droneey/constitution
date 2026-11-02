# Root

> Governs the composition root in Python: the reading of the environment.

## Environment

### environment-read-only-by-the-configuration-provider-and-entry-files → root-alone-reads-the-environment · MUST

`os.environ`, `os.getenv` and `os.putenv` are reached only by the configuration provider, the entry files and specs. No file of the composition root reaches them.

| Why |
|---|
| a read of the environment anywhere else is a dependency on the process that no signature shows and no spec can hand in. |
