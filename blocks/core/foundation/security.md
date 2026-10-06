# Security

> What keeps secrets, dependencies and access safe in any repository. Most of it is held by tools; what they cannot hold is reviewed before a change is handed back.

## Secrets

### no-secret-in-repository · MUST
No secret is written into the repository — not in code, documents, tests or fixtures.

| Why | Tags |
|---|---|
| a secret in the repository is readable by everyone who can read the repository, and by every copy made of it. | [security] |

### secret-never-in-url-or-artefact · MUST
A secret never travels in a URL, and never reaches a build artefact: an image layer, a variable baked in at build time.

| Why | Tags |
|---|---|
| URLs are logged by every proxy and browser, and whatever ships in an artefact is readable by whoever receives it. | [security] |

### leaked-secret-rotated-at-once · MUST
A secret that leaked — into the repository, a log, a message — is rotated at once, and the access made with it while it was exposed is checked.

| Why | Tags |
|---|---|
| a leaked secret is compromised whether or not the leak is undone — every copy and every cache already holds it — and only its access log says whether it was used. | [security] |

### no-secret-or-personal-data-in-output · MUST
No secret and no personal data appear in logs, errors, test data or documents. An error carries identifiers, not the values it rejected.

| Why | Tags |
|---|---|
| output is copied to places with weaker access than the data it came from. | [security, data] |

### scanner-reports-redacted → no-secret-or-personal-data-in-output
A secret scanner's report shows a finding by its rule, file and line, never by its value.

| Why | Tags |
|---|---|
| a report that prints the secret leaks it again, into every log that captures it. | [] |

### least-privilege-credentials · SHOULD
A credential belongs to one identity and one purpose, per environment, with only the permissions its job needs, documented beside its use. Access is granted to people and services, never through a shared credential.

| Why | Tags |
|---|---|
| a narrow credential limits what a leak can do, and one identity per credential says who did what. | [security] |

### environment-names-declared-in-one-place · SHOULD
Every environment variable the program reads is declared in one place, and code reads only declared names.

| Why | Tags |
|---|---|
| one declaration shows what a deployment must provide, and no module reads a name nobody knows it needs. | [security] |

### configuration-parsed-once-at-boot · MUST
Configuration is parsed once, at boot, into a typed value the rest of the program receives, and a missing or malformed setting fails the start.

| Why | Tags |
|---|---|
| a setting checked where it is first used fails in the middle of a request, long after the deployment that broke it, and one parsed in two places can be read two ways. | [security] |

## Addresses from outside

### outside-addresses-trusted-only-on-an-allowlist · MUST
An address or an origin that comes from outside the program — a redirect target, the origin of a message, a host a caller names — is followed, trusted or reached only when it is on an allowlist of the program's own.

| Why | Tags |
|---|---|
| whoever chooses the address chooses where the program sends its user, whom it believes, or what it reaches on their behalf. | [security] |

## Dependencies

### dependencies-pinned-by-lockfile · MUST
A language uses one package manager and one lockfile, kept in the repository, and the lockfile always matches the manifests.

| Why | Tags |
|---|---|
| two package managers resolve differently, and a lockfile that drifts from its manifests installs versions nobody reviewed. | [security] |

### downloads-pinned-by-version-and-checksum · MUST
A file the program or its build downloads outside a package manager — a binary, an archive, an engine — is pinned to a version and checked against its checksum before it is used.

| Why | Tags |
|---|---|
| an unverified download runs whatever the address serves that day, and a swapped file fails its checksum. | [security] |

### tools-pinned-exactly-by-the-repository · MUST
Every build, test and lint tool is pinned to one exact version in a file of the repository — a development dependency of the manifest, or the toolchain's file for a tool outside the package manager — never installed globally, and production code imports none of them.

| Why | Tags |
|---|---|
| a tool installed globally runs in another version on every machine, a tool's new version changes what the check reports and so is a change someone reviews, and a tool in the program's dependencies ships to every installation. | [security] |

### tools-run-on-the-pinned-runtime → tools-pinned-exactly-by-the-repository
The runtime every tool needs is pinned by the repository; no tool brings one of its own or takes whichever the machine has.

| Why | Tags |
|---|---|
| a runtime nobody pinned differs from one machine to the next, and the tool's result with it. | [] |

### shared-configuration-from-one-pinned-source · SHOULD
A repository takes its tools' configuration, and any other file a shared source offers, from that one source, pinned by version like a dependency — a released archive or a package — and extends or imports it there; it keeps no copy but a template.

| Why | Tags |
|---|---|
| a copy drifts and is fixed in one repository at a time; a pinned source is fixed once and reaches every repository with an update. | [security] |

### shared-configuration-taken-by-the-tools-own-mechanism → shared-configuration-from-one-pinned-source
A repository takes a shared configuration through the tool's own way of extending one, else through a one-line module that re-exports it, else through the tool's remote configuration.

| Why | Tags |
|---|---|
| the closer to the tool's own mechanism, the less glue each repository writes and keeps. | [] |

### template-copied-once-owned-by-consumer · SHOULD
A file no tool can extend is a template: kept canonical in the source that offers it, copied once, then owned by the repository that copied it. Copies stay alike by convention, with no checker; a template that needs a checker should have been a file a tool extends.

| Why | Tags |
|---|---|
| a template is for files a tool cannot share, and pretending to keep copies in sync costs more than the drift. | [] |

### program-dependencies-ranged-lockfile-pins · SHOULD
A dependency of the program is declared in the manifest by the range of versions it works with, and the lockfile pins the exact version installed.

| Why | Tags |
|---|---|
| the manifest says what is compatible, the lockfile what is installed, so an update within the range touches the lockfile alone. | [security] |

### one-version-per-dependency · MUST
Each dependency has one version across every manifest of the repository.

| Why | Tags |
|---|---|
| two versions of one dependency behave differently in two places, and the difference is found in production. | [] |

### dependencies-imported-from-their-entries · MUST
A dependency is imported only from the entries it publishes, never from its internal paths.

| Why | Tags |
|---|---|
| internal paths change between releases without notice, and an update then breaks the program. | [] |

### package-entries-curated → module-hides-much-behind-small-public-entry · MUST
A package others import offers its consumers its entries and nothing else, and its manifest lists them wherever its language's manifest can say so.

| Why | Tags |
|---|---|
| every path a consumer can reach becomes part of the contract, and cannot change without breaking someone. | [] |

### ci-steps-pinned-to-immutable-references · MUST
A third-party step of CI is pinned to an immutable reference, never to a moving tag or branch.

| Why | Tags |
|---|---|
| a moving reference lets its owner, or an attacker who owns it, change the code the pipeline runs with its secrets. | [security] |

### dependency-release-cooldown · SHOULD
A new release of a dependency is adopted only after a cooldown of some days. A fix for a known vulnerability that cannot wait is exempted by name, with its advisory beside the exemption, and the exemption leaves at the next update.

| Why | Tags |
|---|---|
| most hijacked releases are found and pulled within days, and waiting lets others find them first; an exemption holds for every later release of its name, so one left behind lifts the cooldown for good. | [security] |

### new-dependency-vetted · SHOULD
A new dependency is a decision: it needs a reason it cannot be a few lines of the project's own, and it is checked against the risk signs of a new package — a name one typo from a popular one, younger than thirty days, under a hundred weekly downloads, a recent change of owner, no source repository, obfuscated code.

| Why | Tags |
|---|---|
| each dependency is code the project runs with its own rights, and these signs mark most malicious packages. | [security] |

### deprecated-packages-replaced · SHOULD
A dependency deprecated as a whole is replaced — by its successor, another package, or the project's own code.

| Why | Tags |
|---|---|
| a deprecated package gets no more fixes, so its next vulnerability stays open. | [] |

### agent-extensions-vetted-as-dependencies → new-dependency-vetted
A server, plugin or skill that extends an agent is a dependency, vetted as one and pinned to a version even when it runs outside the lockfile.

| Why | Tags |
|---|---|
| an extension runs with the agent's rights over the code, the secrets and the network, so a bad one is a malicious package with a shell. | [security] |

### install-scripts-only-for-listed-dependencies · MUST
A dependency's install scripts run only when the dependency is listed by name as allowed to run them.

| Why | Tags |
|---|---|
| an install script runs with the developer's rights before anyone reviews what it does. | [security] |

### known-vulnerabilities-fail-the-check · MUST
No dependency, development dependencies included, has a known vulnerability of any severity.

| Why | Tags |
|---|---|
| a vulnerability found by the check is fixed before release; one accepted without an expiry is accepted forever. | [security] |

### licences-from-an-allowlist · MUST
Every dependency the program ships or loads at runtime has a licence on the project's allowlist; a tool that only builds, tests or checks it may stay off the list, named with its reason.

| Why | Tags |
|---|---|
| a licence the project cannot honour is a legal obligation it took on without knowing; a tool that never ships passes no obligation on. | [security] |

## Operations

### irreversible-operations-behind-a-flag · MUST
An operation a person or an agent runs against a system — a script, a command line, a migration, a deployment — that destroys data, spends money, touches a live system or sends something outward runs only behind an explicit flag; without it, the operation is a dry run that shows what it would do.

| Why | Tags |
|---|---|
| an irreversible operation run by mistake cannot be undone by a better test. | [security, ux] |
