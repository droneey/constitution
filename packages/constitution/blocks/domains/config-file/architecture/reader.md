# Reader

> Governs the port that reads the config file, the adapter that parses it, and what a feature knows of the file.

## General

### config-file-parsed-by-its-adapter → layer-imports-dependencies-by-its-role · MUST

The schema that parses the config file, and the library it is written with, live in the adapter that implements that port, which maps what it parsed to the config file's type and resolves the file's references through a resolver the root hands it; neither that module's domain and application nor the rest of `composition/` imports a parsing library.

| Why |
|---|
| the file is outside input whose format is a detail of the edge, so the program's own type changes only when the program does, never when the library or the format does. |

### feature-blind-to-the-config-file → feature-asks-another-through-its-own-contract · MUST

A feature never reads the config file or its schema: it declares in its own words the vocabulary its section is built from, and receives an input built for it. The config file's type, which joins every feature's section, is the program's own, declared beside the port that reads the file in the contracts of the composition module that splits it.

| Why |
|---|
| each feature stays blind to the others and to the file's format, and a type that changes with every feature's section stays out of the kernel. |
