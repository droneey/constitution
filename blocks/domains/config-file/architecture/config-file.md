# Config file

> Governs where the file's schema lives.

## Placement

### config-file-schema-lives-in-composition → composition-lifts-on-its-second-consumer · MUST
The config file's schema, which joins the sections of several features, lives in `composition/` from the start.

| Why | Tags |
|---|---|
| every entry that reads the config file needs the whole of it, so its schema belongs in the one place that knows every feature. | [] |

### feature-blind-to-the-config-file → feature-asks-another-through-its-own-contract · MUST
A feature never reads the config file or its schema: it declares in its own words the vocabulary its section is built from, and receives an input built for it.

| Why | Tags |
|---|---|
| each feature stays blind to the others and to the file's format, and the config file is assembled in one place. | [] |
