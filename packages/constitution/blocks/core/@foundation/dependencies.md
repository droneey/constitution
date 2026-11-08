# Dependencies

> Governs packages, downloads and tools taken from others.

## Vocabulary

The **standard library**{#standard-library} is the language's own, extended only by the effect-free libraries a language's block names, each with its reason, such as the extension of the standard its language's own maintainers ship; a parser, a validator of schemas or a vendor's client is never one. A library so named counts as the standard library wherever a rule limits what code may import, and stays a dependency the rules of this chapter hold.

A **registry**, in this chapter always a package registry, is a service that serves the released versions of packages immutably.

A package's **published entries** are what it lets other packages import: its surface, as the layout chapter defines it, and each further entry its manifest declares.

An **extension of an agent**, an agent as the agents chapter defines it, is a server, an add-on or a set of instructions that adds actions or knowledge to an agent and runs with its rights.

A **download** is a file or a reusable unit of work the program, its build or its automation fetches outside a package manager, such as a binary, an archive or an image.

A download's **digest** is a checksum of its content or an immutable content identifier that names it.

## Pinning

### dependencies-locked-by-one-lockfile · MUST

Where its ecosystem has a lockfile, every language's dependencies are pinned by one.

| Why |
|---|
| dependencies no lockfile pins install whatever versions each install resolves, so two machines run different code from the same manifests. |

### lockfile-kept-in-the-repository · MUST

Every lockfile is kept in the repository.

| Why |
|---|
| a lockfile kept outside the repository pins nothing for whoever installs from the repository, and changes in no change anyone reviews. |

### lockfile-matches-its-manifests · MUST

Every lockfile always matches its manifests.

| Why |
|---|
| a lockfile that drifts from its manifests installs versions nobody reviewed. |

### dependencies-managed-by-one-package-manager · MUST

Every language's dependencies are managed by one package manager.

| Why |
|---|
| two package managers resolve differently, so the same manifests install different versions. |

### download-pinned-to-its-version · MUST

Every download is pinned to its most specific version, which stands beside its digest wherever one pins it, never a digest alone.

| Why |
|---|
| a download at a moving version runs whatever its address serves that day, and a digest alone hides from its reader and its updater which release it is. |

### download-checked-against-its-digest · MUST

Every download is checked against its digest before it is used, never trusted on its version alone. Exempt: code its maker changes by design, such as a tag manager's or a payment provider's script, which the program loads only from the one origin it allows that code, through one loader.

| Why |
|---|
| a download no digest checks runs whatever its address serves, the version it names included, once that address or its server is taken. |

### tool-pinned-exactly-by-the-repository · MUST

Every tool no lockfile pins, and the code's runtime, is pinned to one exact version in a file of the repository. Exempt: the build tool a package's manifest requires, which whoever builds the package resolves and which is held to a range below the next release the tool's own versioning marks incompatible.

| Why |
|---|
| a version no file pins is whatever each machine resolves, so the check reports differently from one machine to the next. |

### pinned-tool-never-installed-globally · MUST

Every tool the repository pins, and the code's runtime, is installed for the repository, never globally. Exempt: the build tool a package's manifest requires, which whoever builds the package installs.

| Why |
|---|
| a tool installed globally runs in another version on every machine, and its new version changes what the check reports. |

### agent-extension-pinned · MUST

Every extension of an agent is pinned to an exact version or digest. It never runs at a moving reference; a remote one whose version cannot be pinned has its declaration of what it offers pinned, and a changed declaration is withheld until a person has reviewed it. One that is a download is pinned as the download-pinned-to-its-version rule pins every download.

| Why |
|---|
| an extension runs with the agent's rights, and its next release can turn malicious with no sign but a changed declaration. |

## Installing

### dependency-installed-only-from-a-registry · MUST

Every package, a transitive one included, is installed only from a registry. It is never installed from the place its code is developed, an archive's address or a path outside the repository. Exempt: a package of an ecosystem with no registry, taken as a download, pinned and checked.

| Why |
|---|
| a dependency from where its code is developed, an address or a path has no release date for the cooldown and no provenance, and runs code as it installs even where install scripts are off. |

### private-package-installed-only-from-its-named-registry · MUST

Every private package is installed only from the registry the project names for it. A private package is one served only by a registry that is not open to all, such as a company's own.

| Why |
|---|
| a private name that is free on a public registry is installed from whoever claims it there. |

### dependency-provenance-verified · MUST

Every dependency whose registry publishes provenance or signatures is installed only once they verify.

| Why |
|---|
| a hijacked release is published from somewhere else than its project's own build, and its provenance does not verify. |

### release-that-lost-its-provenance-refused · MUST

Every release of a dependency that lacks the provenance or signatures its earlier releases carried is rejected.

| Why |
|---|
| a hijacked release is published outside its project's own build, so it lacks what that build attached, and the missing provenance is the one sign a release with nothing to verify gives. |

### new-release-adopted-after-a-cooldown · MUST

Every new release of a dependency is adopted only after a cooldown of at least three days. Exempt: a fix for a known vulnerability that cannot wait, exempted by name with its advisory beside the exemption, which leaves at the next update.

| Why |
|---|
| of ten major hijacked releases of 2024 and 2025, seven were found within hours, and the largest package registry lets an author unpublish a release for its first three days, so a release that waited three days has outlived most hijacks and can no longer vanish from under its adopters — Woodruff's dependency cooldowns (2025). |

### install-scripts-run-only-for-listed-dependencies · MUST

Every dependency runs code as it is installed or built only when it is listed by name as allowed to.

| Why |
|---|
| an install script runs with the developer's rights before anyone reviews what it does. |

## Choosing and using

### new-dependency-vetted · SHOULD

Every new dependency, an extension of an agent included, is vetted before it is added. Its name is confirmed in the registry as the intended project rather than taken from generated code, and it is checked against the signs of a malicious package, such as a name one typo from a popular one, a recent first release or change of owner, few downloads, no published source or obfuscated code.

| Why |
|---|
| a dependency runs with the project's rights, so one added unvetted, as a name generated code invented, runs its author's code in every build. |

### new-dependency-needed · SHOULD

Every new dependency, an extension of an agent included, has a reason it cannot be a few lines of the project's own.

| Why |
|---|
| a dependency added for what a few lines would do brings its own updates, vulnerabilities and licence for nothing the project needed. |

### dependency-reached-through-its-published-entries · MUST

Every dependency is reached only through its published entries, never through its internal paths.

| Why |
|---|
| internal paths change between releases without notice, so code that reaches one breaks at an update no changelog warned of. |

### package-declares-every-dependency-it-imports · MUST

Every package declares in its own manifest every dependency it imports, never relying on one that another manifest or another dependency brings. Exempt: the language's own library.

| Why |
|---|
| an undeclared import works only while another declaration happens to bring it, and breaks the package when it is installed alone or that declaration goes. |

### production-code-imports-no-tool · MUST

All production code imports only the dependencies it runs on, never one that only builds, tests or lints.

| Why |
|---|
| a tool imported by the program ships with it, and its next release changes the program without anyone choosing it. |

## Health

### known-vulnerability-reported-by-the-check · MUST

Every known vulnerability of every dependency is reported by the check, a development one and an accepted one included.

| Why |
|---|
| a vulnerability the check keeps quiet about is one nobody weighs again, so one accepted as out of the program's reach is first noticed by its attacker once a change brings it within reach. |

### dependency-free-of-known-vulnerabilities · MUST

Every change fails the check while a dependency, a development one included, has a known vulnerability. Exempt: a vulnerability a person accepted by name, with its advisory, why it does not reach the program or why no fix exists yet, and a date to review it.

| Why |
|---|
| a known vulnerability shipped is one an attacker already knows how to use, whatever its severity says of it in general, and one kept without a person who accepted it and a date to review it is forgotten until it is exploited. |

### dependency-licence-on-the-allowlist · MUST

Every dependency the program ships or loads at run time has a licence on the project's allowlist. Exempt: a tool that only builds, tests or checks it, named with its reason, and the system the program runs on, such as an operating system, an image's base and its system packages.

| Why |
|---|
| a licence the project cannot honour is an obligation it took on without knowing, while the system it runs on comes under that system's own licences. |

### deprecated-dependency-replaced · MUST

Every dependency deprecated as a whole is replaced by its successor, another package or the project's own code.

| Why |
|---|
| a deprecated package gets no more fixes, so its next vulnerability stays open. |
