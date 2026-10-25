# Dependencies

> Governs packages, downloads and tools taken from others.

## Pinning

### dependencies-locked-by-one-lockfile · MUST

The dependencies of a language are managed by one package manager and pinned by one lockfile, kept in the repository and always matching its manifests.

| Why |
|---|
| two package managers resolve differently, and a lockfile that drifts from its manifests installs versions nobody reviewed. |

### download-pinned-by-version-and-checksum · MUST

A file or a reusable step the program, its build or its pipeline fetches outside a package manager — a binary, an archive, an image, a step of another repository — is pinned to a version and checked against its checksum or digest before it is used; a commit's full hash counts as a digest.

| Why |
|---|
| an unverified download runs whatever its address serves that day. |

### tool-pinned-exactly-by-the-repository · MUST

A dependency that builds, tests or lints, and the runtime it runs on, is pinned to one exact version in a file of the repository, never installed globally; the build backend a package's manifest requires, which whoever builds the package resolves, is capped below its next minor instead.

| Why |
|---|
| a tool installed globally runs in another version on every machine, and its new version changes what the check reports. |

### production-code-imports-no-tool · MUST

Production code imports no dependency that only builds, tests or lints.

| Why |
|---|
| a tool imported by the program ships with it, and its next release changes the program without anyone choosing it. |

### dependency-installed-only-from-a-registry · MUST

A package a package manager installs, a transitive one included, comes only from a registry — a private one only from the registry the project names for it — never from a source repository, an archive's address or a path outside the repository.

| Why |
|---|
| a private name that is free on a public registry is installed from whoever claims it there, and a dependency from a repository, an address or a path has no release date for the cooldown and no provenance, and runs code as it installs even where install scripts are off. |

## Choosing and using

### new-dependency-vetted · SHOULD

A new dependency is a decision: it needs a reason it cannot be a few lines of the project’s own, its name is confirmed in the registry as the intended project rather than taken from generated code, and it is checked against the signs of a malicious package — a name one typo from a popular one, a recent first release or change of owner, few downloads, no source repository, obfuscated code.

| Why |
|---|
| each dependency runs with the project’s rights, and these signs mark most malicious packages. |

### new-release-adopted-after-a-cooldown · MUST

A new release of a dependency is adopted only after a cooldown of at least three days; a fix for a known vulnerability that cannot wait is exempted by name, with its advisory beside the exemption, which leaves at the next update.

| Why |
|---|
| most hijacked releases are found and pulled within a day or two, and the major package managers now hold a cooldown of their own, so none is left outside the rule. |

### dependency-provenance-verified · SHOULD

A dependency whose registry publishes provenance or signatures is installed only once they verify, and a version that lost what its earlier versions carried is refused.

| Why |
|---|
| a hijacked release is published from somewhere else than the project's own pipeline, and the missing provenance is the sign. |

### dependency-reached-through-its-public-entry · MUST

A dependency is reached only through the entries it publishes, never through its internal paths.

| Why |
|---|
| internal paths change between releases without notice. |

### install-scripts-run-only-for-listed-dependencies · MUST

A dependency’s install scripts run only when it is listed by name as allowed to run them.

| Why |
|---|
| an install script runs with the developer’s rights before anyone reviews what it does. |

## Health

### dependency-free-of-known-vulnerabilities · MUST

No dependency, development ones included, has a known vulnerability of any severity, save one a person accepted by name, with its advisory, why it does not reach the program or why no fix exists yet, and a date to review it.

| Why |
|---|
| a vulnerability found before release is fixed before release, and one that cannot be is a decision someone signed and will revisit. |

### dependency-licence-on-the-allowlist · MUST

Every dependency the program ships or loads at run time has a licence on the project’s allowlist; a tool that only builds, tests or checks it may stay off the list, named with its reason.

| Why |
|---|
| a licence the project cannot honour is an obligation it took on without knowing. |

### deprecated-dependency-replaced · SHOULD

A dependency deprecated as a whole is replaced — by its successor, another package or the project’s own code.

| Why |
|---|
| a deprecated package gets no more fixes, so its next vulnerability stays open. |
