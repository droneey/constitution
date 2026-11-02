# Dependencies

> Governs packages, downloads and tools taken from others.

The **standard library**{#standard-library} is the language's own, extended only by the effect-free libraries a language's block names, each with its reason, as the extension of the standard its language's own maintainers ship; a parser, a schema library or a vendor's client is never one. A library so named counts as the standard library wherever a rule limits what code may import, and stays a dependency the rules of this chapter hold.

## Pinning

### dependencies-locked-by-one-lockfile · MUST

A language's dependencies are pinned by one lockfile. They are managed by one package manager, and the lockfile is kept in the repository and always matches its manifests.

| Why |
|---|
| two package managers resolve differently, and a lockfile that drifts from its manifests installs versions nobody reviewed. |

### download-pinned-by-version-and-checksum · MUST

A download is pinned to a version and checked against its checksum or digest before it is used. This holds for every file or reusable step the program, its build or its pipeline fetches outside a package manager — a binary, an archive, an image, a step of another repository; a commit's full hash counts as a digest. Wherever a digest or a hash pins a download, the download's most specific version stands beside it, as an image's tag or a step's release does, and neither a tag nor a digest stands alone.

| Why |
|---|
| an unverified download runs whatever its address serves that day, and a digest alone hides from its reader and its updater which release it is. |

### tool-pinned-exactly-by-the-repository · MUST

A tool is pinned to one exact version by the repository. A dependency that builds, tests or lints, and the runtime it runs on, is pinned in a file of the repository, never installed globally; the build backend a package's manifest requires, which whoever builds the package resolves, is capped below its next minor instead.

| Why |
|---|
| a tool installed globally runs in another version on every machine, and its new version changes what the check reports. |

### agent-extension-pinned · MUST

An extension of an agent is pinned to an exact version or digest. A server, plugin or skill that extends an agent never runs at a moving tag or branch; a remote one whose version cannot be pinned has its tool definitions pinned, and a definition that changed is withheld until a person has reviewed it.

| Why |
|---|
| an extension runs with the agent's rights, its next release can turn malicious with no sign but a changed tool definition, and no other download the project fetches is trusted unpinned. |

## Installing

### dependency-installed-only-from-a-registry · MUST

A package is installed only from a registry. Every package a package manager installs, a transitive one included, comes from a registry — a private one only from the registry the project names for it — never from a source repository, an archive's address or a path outside the repository.

| Why |
|---|
| a private name that is free on a public registry is installed from whoever claims it there, and a dependency from a repository, an address or a path has no release date for the cooldown and no provenance, and runs code as it installs even where install scripts are off. |

### dependency-provenance-verified · SHOULD

A dependency whose registry publishes provenance or signatures is installed only once they verify. A version that lost what its earlier versions carried is refused.

| Why |
|---|
| a hijacked release is published from somewhere else than the project's own pipeline, and the missing provenance is the sign. |

### new-release-adopted-after-a-cooldown · MUST

A new release of a dependency is adopted only after a cooldown of at least three days. A fix for a known vulnerability that cannot wait is exempted by name, with its advisory beside the exemption, which leaves at the next update.

| Why |
|---|
| most hijacked releases are found and pulled within a day or two, so a release that waited three days has outlived the window in which they are caught. |

### install-scripts-run-only-for-listed-dependencies · MUST

A dependency’s install scripts run only when it is listed by name as allowed to run them.

| Why |
|---|
| an install script runs with the developer’s rights before anyone reviews what it does. |

## Choosing and using

### new-dependency-vetted · SHOULD

A new dependency, a server, a plugin or a skill that extends an agent included, is vetted before it is added. It is a decision: it needs a reason it cannot be a few lines of the project’s own, its name is confirmed in the registry as the intended project rather than taken from generated code, and it is checked against the signs of a malicious package — a name one typo from a popular one, a recent first release or change of owner, few downloads, no source repository, obfuscated code.

| Why |
|---|
| a dependency runs with the project’s rights, so one added unvetted (a name generated code invented, one a typo from a popular one) runs its author's code in every build; these signs mark most malicious packages. |

### dependency-reached-through-its-published-entries · MUST

A dependency is reached only through the entries it publishes, never through its internal paths.

| Why |
|---|
| internal paths change between releases without notice, so code that reaches one breaks at an update no changelog warned of. |

### production-code-imports-no-tool · MUST

Production code imports no dependency that only builds, tests or lints.

| Why |
|---|
| a tool imported by the program ships with it, and its next release changes the program without anyone choosing it. |

## Health

### dependency-free-of-known-vulnerabilities · MUST

No dependency, a development one included, has a known vulnerability of any severity. The one exception is a vulnerability a person accepted by name, with its advisory, why it does not reach the program or why no fix exists yet, and a date to review it.

| Why |
|---|
| a known vulnerability shipped is one an attacker already knows how to use, and one kept without a person who accepted it and a date to review it is forgotten until it is exploited. |

### dependency-licence-on-the-allowlist · MUST

Every dependency the program ships or loads at run time has a licence on the project’s allowlist. A tool that only builds, tests or checks it may stay off the list, named with its reason, and the system the program runs on — an operating system, an image's base and its system packages — is not held to the list.

| Why |
|---|
| a licence the project cannot honour is an obligation it took on without knowing, while the system it runs on comes under that system's own licences, which govern what runs on it. |

### deprecated-dependency-replaced · SHOULD

A dependency deprecated as a whole is replaced. Its successor, another package or the project’s own code takes its place.

| Why |
|---|
| a deprecated package gets no more fixes, so its next vulnerability stays open. |
