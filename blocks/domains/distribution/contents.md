# Contents

> Governs what a distributed unit ships.

## Files

### distributed-unit-ships-only-what-its-manifest-names · MUST
A distributed unit ships the files its manifest names, and no other.

| Why | Tags |
|---|---|
| a file the manifest does not name — a spec, a local configuration, a secret left in the folder — ships by accident to every consumer. | [security] |

### distributed-unit-ships-its-types · MUST
A distributed unit ships the types of every entry a consumer imports code from, where the consumer's type checker finds them.

| Why | Tags |
|---|---|
| without them a consumer's type checker reads every name of the unit as unchecked, and a change of its signatures breaks the consumer at run time. | [] |

### distributed-unit-ships-its-licence · MUST
A distributed unit ships its licence file.

| Why | Tags |
|---|---|
| a unit is used apart from its repository, and without the licence beside it nobody can lawfully use it. | [] |

### distributed-unit-ships-the-notices-of-what-it-bundles · MUST
A distributed unit that bundles code of others ships their licence notices with it.

| Why | Tags |
|---|---|
| most licences allow redistribution only with their notice, so a bundle without it breaks the licence of every library inside. | [] |

## Entries

### integration-is-an-entry-with-an-optional-framework · SHOULD
A distributed package's integration into a host framework is an entry of its own, and the framework is an optional peer of the package.

| Why | Tags |
|---|---|
| a consumer who uses the framework imports the entry and already has the framework, and one who does not never installs it. | [] |

### readme-shows-install-and-first-use → readme-is-the-front-door · SHOULD
A distributed unit's readme shows the install line and the shortest use: for a configuration package, the one line that extends it and its options; for a command-line tool, its first command.

| Why | Tags |
|---|---|
| a consumer adopts a unit from its readme, and one that must be read in full to start is not adopted. | [] |

### shipped-configuration-asserted-by-spec → spec-proves-one-boundary · MUST
Each distributed configuration has a spec that parses it and asserts its intent.

| Why | Tags |
|---|---|
| a configuration has no behaviour to call, so its spec is what proves it says what it means. | [testing] |
