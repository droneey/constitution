# Contents

> Governs what a distributed unit ships.

## Files

### distributed-unit-ships-only-what-its-manifest-names · MUST

A distributed unit ships the files its manifest names, and no other.

| Why |
|---|
| a file the manifest does not name (a spec, a local configuration, a secret left in the folder) ships by accident to every consumer. |

### distributed-unit-ships-its-types · MUST

A distributed unit ships its types. It ships the types of every entry a consumer imports code from, where the consumer's type checker finds them.

| Why |
|---|
| without them a consumer's type checker reads every name of the unit as unchecked, and a change of its signatures breaks the consumer at run time. |

### distributed-unit-ships-its-licence · MUST

A distributed unit ships its licence. It ships its licence file, and the licence notices of the code of others it bundles.

| Why |
|---|
| a unit is used apart from its repository, and without the licence beside it nobody can lawfully use it; most licences allow redistribution only with their notice, so a bundle without it breaks the licence of every library inside. |

## Entries

### integration-is-an-entry-with-an-optional-framework · SHOULD

A distributed package's integration into a host framework is an entry of its own, and the framework is an optional dependency of the package.

| Why |
|---|
| an integration in the package's main entry, or a framework the package requires, makes every consumer install and load a framework only some of them use. |

### readme-shows-install-and-first-use → readme-is-the-front-door · SHOULD

A distributed unit's readme shows the install line and the shortest use. For a configuration package the shortest use is the one line that extends it and its options; for a command-line tool, its first command.

| Why |
|---|
| a consumer adopts a unit from its readme, and one that must be read in full to start is not adopted. |

### shipped-configuration-asserted-by-spec → spec-proves-one-boundary · MUST

Each distributed configuration has a spec that asserts its settings in one table. The spec parses the configuration; the real tool runs only over what the configuration brings of its own — a plugin, a scope, a glob — and once to prove it loads the configuration, never in a case that proves a rule built into the tool.

| Why |
|---|
| a configuration has no behaviour to call, so one whose settings no spec asserts can say other than it means and pass every check; a case that runs a rule built into the tool proves only the tool's own code, which its authors test, and slows every run for no bug of the program's. |
