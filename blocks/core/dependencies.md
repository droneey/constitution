# Dependencies

> Governs code the project takes from others: packages, downloads and tools.

## Pinning

### dependencies-locked-by-one-lockfile · MUST
The dependencies of a language are managed by one package manager and pinned by one lockfile, kept in the repository and always matching its manifests.

| Why | Tags |
|---|---|
| two package managers resolve differently, and a lockfile that drifts from its manifests installs versions nobody reviewed. | [security] |

### download-pinned-by-version-and-checksum · MUST
A file the program or its build downloads outside a package manager — a binary, an archive, an image — is pinned to a version and checked against its checksum or digest before it is used.

| Why | Tags |
|---|---|
| an unverified download runs whatever its address serves that day. | [security] |

### tool-pinned-exactly-by-the-repository · MUST
Every build, test and lint tool, and the runtime it runs on, is pinned to one exact version in a file of the repository, never installed globally, and production code imports none of them.

| Why | Tags |
|---|---|
| a tool installed globally runs in another version on every machine, and its new version changes what the check reports. | [security] |

### dependency-resolved-from-its-declared-registry · SHOULD
The package manager names the registry of every scope, and a private package’s name is scoped so it never resolves from a public registry.

| Why | Tags |
|---|---|
| a private name that is free on a public registry is installed from whoever claims it there. | [security] |

## Choosing and using

### new-dependency-vetted · SHOULD
A new dependency is a decision: it needs a reason it cannot be a few lines of the project’s own, its name is confirmed in the registry as the intended project rather than taken from generated code, and it is checked against the signs of a malicious package — a name one typo from a popular one, a recent first release or change of owner, few downloads, no source repository, obfuscated code.

| Why | Tags |
|---|---|
| each dependency runs with the project’s rights, and these signs mark most malicious packages. | [security] |

### new-release-adopted-after-a-cooldown · SHOULD
A new release of a dependency is adopted only after a cooldown of some days; a fix for a known vulnerability that cannot wait is exempted by name, with its advisory beside the exemption, which leaves at the next update.

| Why | Tags |
|---|---|
| most hijacked releases are found and pulled within days. | [security] |

### dependency-reached-through-its-public-entry · MUST
A dependency is reached only through the entries it publishes, never through its internal paths.

| Why | Tags |
|---|---|
| internal paths change between releases without notice. | [] |

### install-scripts-run-only-for-listed-dependencies · MUST
A dependency’s install scripts run only when it is listed by name as allowed to run them.

| Why | Tags |
|---|---|
| an install script runs with the developer’s rights before anyone reviews what it does. | [security] |

## Health

### dependency-free-of-known-vulnerabilities · MUST
No dependency, development ones included, has a known vulnerability of any severity.

| Why | Tags |
|---|---|
| a vulnerability found before release is fixed before release. | [security] |

### dependency-licence-on-the-allowlist · MUST
Every dependency the program ships or loads at run time has a licence on the project’s allowlist; a tool that only builds, tests or checks it may stay off the list, named with its reason.

| Why | Tags |
|---|---|
| a licence the project cannot honour is an obligation it took on without knowing. | [security] |

### deprecated-dependency-replaced · SHOULD
A dependency deprecated as a whole is replaced — by its successor, another package or the project’s own code.

| Why | Tags |
|---|---|
| a deprecated package gets no more fixes, so its next vulnerability stays open. | [] |
