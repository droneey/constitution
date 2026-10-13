# Config file

> Governs where the file's type and the schema that parses it live.

## Placement

### config-file-type-declared-with-its-port → code-placed-by-its-reason-to-change · MUST
The config file's type, which joins the sections of several features, is a type of the program's own, declared in the top-level `contracts/` beside the port that reads the file; `composition/` splits it into each feature's section.

| Why | Tags |
|---|---|
| the adapter that parses the file and the composition that splits it both reach `contracts/`, and neither may reach the other. | [] |

### config-file-parsed-by-its-adapter → layer-imports-dependencies-by-its-role · MUST
The schema that parses the config file, and the library it is written with, live in the adapter that implements that port, which maps what it parsed to the config file's type and resolves the file's references through a resolver the root hands it; neither `contracts/` nor `composition/` imports a parsing library.

| Why | Tags |
|---|---|
| the file is outside input whose format is a detail of the edge, so the program's own type changes only when the program does, never when the library or the format does. | [] |

### feature-blind-to-the-config-file → feature-asks-another-through-its-own-contract · MUST
A feature never reads the config file or its schema: it declares in its own words the vocabulary its section is built from, and receives an input built for it.

| Why | Tags |
|---|---|
| each feature stays blind to the others and to the file's format, and the config file is assembled in one place. | [] |
