# Contents

> Governs what a distributed package ships, how it offers its integrations and what its readme shows.

## Vocabulary

A **distributed package** is a package others install from a registry, as core's dependencies chapter defines a registry: a package whose code they import or whose configuration they extend, or a program such as a command-line tool its users install. Whoever installs it is, in this block, its consumer.

## Files

### distributed-package-ships-only-what-its-manifest-names · MUST

Every distributed package ships only the files its manifest names. Exempt: a file that packing it for its registry always includes, such as its readme, its licence file or its manifest.

| Why |
|---|
| a file the manifest does not name (a spec, a local configuration, a secret left in the folder) ships by accident to every consumer. |

### distributed-package-ships-its-types · MUST

Wherever the package's language has a type checker, every distributed package ships the types of every entry a consumer imports code from. They lie where the consumer's type checker finds them.

| Why |
|---|
| without them a consumer's type checker reads every name of the package as unchecked, and a change of its signatures breaks the consumer at run time. |

### distributed-package-ships-its-licence · MUST

Every distributed package ships its licence file.

| Why |
|---|
| a package is used apart from its repository, and without the licence beside it nobody can lawfully use it. |

### bundled-code-licence-notices-shipped · MUST

Every distributed package that bundles code of others ships the licence notices of that code.

| Why |
|---|
| most licences allow redistribution only with their notice, so a bundle without it breaks the licence of every library inside. |

### shipped-content-kind-has-its-own-folder → folder-has-one-purpose · SHOULD

Every kind of content a distributed package ships as written has a folder of its own at the package's root. Such kinds are, for instance, templates, schemas and presets, and the code its build compiles or bundles is none.

| Why |
|---|
| content of several kinds in one folder is told apart only by its names, so a tool or a reader that takes one kind takes the others with it. |

## Integrations

### integration-is-an-entry-of-its-own · SHOULD

Every distributed package's integration into a host framework is an entry of its own, never part of the package's main entry.

| Why |
|---|
| an integration in the package's main entry makes every consumer load a framework only some of them use. |

### integration-framework-an-optional-dependency · SHOULD

No host framework a distributed package integrates into is a required dependency of the package. It is declared as an optional peer where the ecosystem has peer dependencies, otherwise as a dependency installed only with the integration that needs it.

| Why |
|---|
| a framework the package requires makes every consumer install a framework only some of them use. |

## Readme

### readme-shows-the-shortest-use · SHOULD

Every distributed package's readme shows its shortest use beside the line that installs it. For a configuration package that is the one line that extends it, with its options; for a command-line tool, its first command.

| Why |
|---|
| a consumer adopts a package from its readme, and one that must be read in full to start is not adopted. |
