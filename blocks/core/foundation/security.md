# Security

> What keeps secrets, dependencies and access safe in any repository. Most of it is held by tools; what they cannot hold is reviewed before a change is handed back.

## Secrets

## no-secret-in-repository · MUST
No secret is committed — not in code, documents, tests, fixtures or history. A secret scanner runs on every change, through the check.

| Why | Check | Tags |
|---|---|---|
| a committed secret is readable by everyone who ever clones the repository, long after it is deleted. | tool/secrets | [security] |

## secret-never-in-url-or-artefact · MUST
A secret never travels in a URL, and never reaches a build artefact: an image layer, a client bundle, a variable baked in at build time.

| Why | Check | Tags |
|---|---|---|
| URLs are logged by every proxy and browser, and whatever ships in an artefact is readable by whoever receives it. | review | [security] |

## leaked-secret-rotated-at-once · MUST
A secret that leaked — into a commit, a log, a message — is rotated at once, and the access made with it while it was exposed is checked. Rewriting the history does not undo a leak into a commit.

| Why | Check | Tags |
|---|---|---|
| a leaked secret is compromised whether or not the leak is undone — every clone and every cache already holds it — and only its access log says whether it was used. | review | [security] |

## no-secret-or-personal-data-in-output · MUST
No secret and no personal data appear in logs, errors, test data or documents. An error carries identifiers, not the values it rejected.

| Why | Check | Tags |
|---|---|---|
| output is copied to places with weaker access than the data it came from. | review | [security, data] |

## local-environment-file-ignored · SHOULD
The local environment file is ignored by version control; its committed example carries placeholders only.

| Why | Check | Tags |
|---|---|---|
| the real values stay on the machine they belong to, and a real value never lands in the example. | review | [security] |

## least-privilege-credentials · SHOULD
A credential belongs to one identity and one purpose, per environment, with only the permissions its job needs, documented beside its use. Access is granted to people and services, never through a shared credential.

| Why | Check | Tags |
|---|---|---|
| a narrow credential limits what a leak can do, and one identity per credential says who did what. | review | [security] |

## Dependencies

## dependencies-pinned-by-lockfile · MUST
A language uses one package manager, and one lockfile, committed. Installs, in CI and locally, follow the lockfile exactly and fail when it drifts from the manifest.

| Why | Check | Tags |
|---|---|---|
| two package managers resolve differently, and an install that ignores the lockfile runs code nobody reviewed. | review | [security] |

## ci-steps-pinned-to-immutable-references · MUST
A third-party step of CI is pinned to an immutable reference, never to a moving tag or branch.

| Why | Check | Tags |
|---|---|---|
| a moving reference lets its owner, or an attacker who owns it, change the code the pipeline runs with its secrets. | review | [security] |

## dependency-release-cooldown · SHOULD
A new release of a dependency is adopted only after a cooldown of some days, except a fix for a known vulnerability.

| Why | Check | Tags |
|---|---|---|
| most hijacked releases are found and pulled within days; waiting lets others find them first. | review | [security] |

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
A server, plugin or skill that extends an agent is added like a dependency: vetted, pinned to a version, and given only the access its job needs.

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
Every dependency's licence is on the project's allowlist.

| Why | Check | Tags |
|---|---|---|
| a licence the project cannot honour is a legal obligation it took on without knowing. | tool/audit | [security] |

## Operations and access

## access-denied-unless-granted · MUST
Access is denied unless a rule grants it, and a test proves the access of each operation a caller outside the program can reach: a route, an endpoint, a command.

| Why | Check | Tags |
|---|---|---|
| access open by default is open wherever someone forgot a rule, and only a test notices the operation that forgot. | test | [security] |

## irreversible-operations-behind-flag-and-human · MUST
An operation that destroys data, spends money, touches a live system or sends something outward runs only with an explicit flag and a person's go-ahead; its default is to show what it would do.

| Why | Check | Tags |
|---|---|---|
| an irreversible operation run by mistake cannot be undone by a better test. | review | [security, ux] |
