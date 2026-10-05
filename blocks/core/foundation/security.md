# Security

> What keeps secrets, dependencies and access safe in any repository. Most of it is held by tools; what they cannot hold is reviewed before a change is handed back.

## Secrets

## no-secret-in-repository · MUST
No secret is written into the repository — not in code, documents, tests or fixtures. A secret scanner runs on every change, through the check.

| Why | Check | Tags |
|---|---|---|
| a secret in the repository is readable by everyone who can read the repository, and by every copy made of it. | tool/secrets | [security] |

## secret-never-in-url-or-artefact · MUST
A secret never travels in a URL, and never reaches a build artefact: an image layer, a client bundle, a variable baked in at build time.

| Why | Check | Tags |
|---|---|---|
| URLs are logged by every proxy and browser, and whatever ships in an artefact is readable by whoever receives it. | review | [security] |

## leaked-secret-rotated-at-once · MUST
A secret that leaked — into the repository, a log, a message — is rotated at once, and the access made with it while it was exposed is checked.

| Why | Check | Tags |
|---|---|---|
| a leaked secret is compromised whether or not the leak is undone — every copy and every cache already holds it — and only its access log says whether it was used. | review | [security] |

## no-secret-or-personal-data-in-output · MUST
No secret and no personal data appear in logs, errors, test data or documents. An error carries identifiers, not the values it rejected.

| Why | Check | Tags |
|---|---|---|
| output is copied to places with weaker access than the data it came from. | review | [security, data] |

## least-privilege-credentials · SHOULD
A credential belongs to one identity and one purpose, per environment, with only the permissions its job needs, documented beside its use. Access is granted to people and services, never through a shared credential.

| Why | Check | Tags |
|---|---|---|
| a narrow credential limits what a leak can do, and one identity per credential says who did what. | review | [security] |

## Dependencies

## dependencies-pinned-by-lockfile · MUST
A language uses one package manager, and one lockfile, kept in the repository. Installs, in CI and locally, follow the lockfile exactly and fail when it drifts from the manifest.

| Why | Check | Tags |
|---|---|---|
| two package managers resolve differently, and an install that ignores the lockfile runs code nobody reviewed. | review | [security] |

## downloads-pinned-by-version-and-checksum · MUST
A file the program or its build downloads outside a package manager — a binary, an archive, an engine — is pinned to a version and checked against its checksum before it is used.

| Why | Check | Tags |
|---|---|---|
| an unverified download runs whatever the address serves that day, and a swapped file fails its checksum. | review | [security] |

## tools-pinned-exactly-by-the-repository · MUST
Every build, test and lint tool is pinned to one exact version in a file of the repository — a development dependency of the manifest, or the toolchain's file for a tool outside the package manager — never installed globally, and production code imports none of them.

| Why | Check | Tags |
|---|---|---|
| a tool installed globally runs in another version on every machine, a tool's new version changes what the check reports and so is a change someone reviews, and a tool in the program's dependencies ships to every installation. | review | [security] |

## tools-run-on-the-pinned-runtime → tools-pinned-exactly-by-the-repository
Every tool runs on a runtime the repository pins, never on one a tool downloads or finds on the machine.

| Why | Check | Tags |
|---|---|---|
| a runtime nobody pinned differs from one machine to the next, and the tool's result with it. | review | [] |

## shared-configuration-from-one-pinned-source · SHOULD
A repository takes its tools' configuration, and any other file a shared source offers, from that one source, pinned by version like a dependency — a released archive or a package — and extends or imports it there; it never keeps a copy.

| Why | Check | Tags |
|---|---|---|
| a copy drifts and is fixed in one repository at a time; a pinned source is fixed once and reaches every repository with an update. | review | [security] |

## program-dependencies-ranged-lockfile-pins · SHOULD
A dependency of the program is declared in the manifest by the range of versions it works with, and the lockfile pins the exact version installed.

| Why | Check | Tags |
|---|---|---|
| the manifest says what is compatible, the lockfile what is installed, so an update within the range touches the lockfile alone. | review | [security] |

## one-version-per-dependency · MUST
Each dependency has one version across every manifest of the repository.

| Why | Check | Tags |
|---|---|---|
| two versions of one dependency behave differently in two places, and the difference is found in production. | review | [] |

## ci-steps-pinned-to-immutable-references · MUST
A third-party step of CI is pinned to an immutable reference, never to a moving tag or branch.

| Why | Check | Tags |
|---|---|---|
| a moving reference lets its owner, or an attacker who owns it, change the code the pipeline runs with its secrets. | review | [security] |

## dependency-release-cooldown · SHOULD
A new release of a dependency is adopted only after a cooldown of some days. A fix for a known vulnerability that cannot wait is exempted by name, with its advisory beside the exemption, and the exemption leaves at the next update.

| Why | Check | Tags |
|---|---|---|
| most hijacked releases are found and pulled within days, and waiting lets others find them first; an exemption holds for every later release of its name, so one left behind lifts the cooldown for good. | review | [security] |

## new-dependency-vetted · SHOULD
A new dependency is a decision: it needs a reason it cannot be a few lines of the project's own, and it is checked against the risk signs of a new package — a name one typo from a popular one, younger than thirty days, under a hundred weekly downloads, a recent change of owner, no source repository, obfuscated code.

| Why | Check | Tags |
|---|---|---|
| each dependency is code the project runs with its own rights, and these signs mark most malicious packages. | review | [security] |

## deprecated-packages-replaced → new-dependency-vetted
A dependency deprecated as a whole is replaced — by its successor, another package, or the project's own code.

| Why | Check | Tags |
|---|---|---|
| a deprecated package gets no more fixes, so its next vulnerability stays open. | review | [] |

## agent-extensions-vetted-as-dependencies → new-dependency-vetted
A server, plugin or skill that extends an agent is a dependency, vetted as one and pinned to a version even when it runs outside the lockfile.

| Why | Check | Tags |
|---|---|---|
| an extension runs with the agent's rights over the code, the secrets and the network, so a bad one is a malicious package with a shell. | review | [security] |

## install-scripts-only-for-listed-dependencies · MUST
A dependency's install scripts run only when the dependency is listed by name as allowed to run them.

| Why | Check | Tags |
|---|---|---|
| an install script runs with the developer's rights before anyone reviews what it does. | review | [security] |

## known-vulnerabilities-fail-the-check · MUST
A known vulnerability of any severity in any dependency, development dependencies included, fails the check.

| Why | Check | Tags |
|---|---|---|
| a vulnerability found by the check is fixed before release; one accepted without an expiry is accepted forever. | tool/audit | [security] |

## licences-from-an-allowlist · MUST
Every dependency the program ships or loads at runtime has a licence on the project's allowlist; a tool that only builds, tests or checks it may stay off the list, named with its reason.

| Why | Check | Tags |
|---|---|---|
| a licence the project cannot honour is a legal obligation it took on without knowing; a tool that never ships passes no obligation on. | tool/audit | [security] |

## Operations

## irreversible-operations-behind-flag-and-human · MUST
An operation a person or an agent runs against a system — a script, a command line, a migration, a deployment — that destroys data, spends money, touches a live system or sends something outward runs only with an explicit flag and a person's go-ahead; its default is to show what it would do.

| Why | Check | Tags |
|---|---|---|
| an irreversible operation run by mistake cannot be undone by a better test. | review | [security, ux] |
