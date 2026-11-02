# Reader

> Governs the port that reads the config file, the adapter that parses it, and what a feature knows of the file.

## General

### config-file-parsed-by-its-adapter → layer-imports-dependencies-by-its-role · MUST

The config file is parsed in the adapter that reads it. The schema and the library it is written with live in that adapter, which implements the port that reads the file, maps what it parsed to the config file's type and resolves the file's references through a resolver the root hands it; neither that module's domain and application layers nor the rest of `composition/` imports a parsing library.

| Why |
|---|
| a parsing library imported past the adapter ties the program's own type to that library and that format, so a change of either reaches code that never reads the file — ports and adapters. |

### feature-blind-to-the-config-file → port-declared-by-the-layer-that-needs-it · MUST

Only the composition module that splits the config file knows it: a feature never reads the file or its schema. A feature declares in its own words the vocabulary its section is built from, and receives an input built for it. The config file's type, which joins every feature's section, is the program's own, declared beside the port that reads the file.

| Why |
|---|
| a feature that reads the file depends on every other feature's section and on the file's format, so a change to any of them reaches it, and a type that changes with every section would put that churn in the kernel. |
