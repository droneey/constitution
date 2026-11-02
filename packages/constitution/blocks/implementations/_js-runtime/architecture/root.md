# Root

> Governs the reading of the environment under a JavaScript runtime.

## Environment

### process-env-read-only-by-the-configuration-provider-and-entry-files → root-alone-reads-the-environment · MUST

`process.env` is read only by the configuration provider, the entry files and specs. This holds for every alias of it the runtime offers, and no file of the composition root reads it.

| Why |
|---|
| a read of it deep in the program is a dependency on the process that no signature shows, so the unit that makes it cannot be run or tested apart from the environment it reads. |
