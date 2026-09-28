# Security

> What keeps secrets, dependencies and access safe in any repository. Most of it is held by tools; what they cannot hold is reviewed before a change is handed back.

## Secrets

## no-secret-in-repository · MUST
No secret is committed — not in code, documents, tests, fixtures or history. A secret scanner runs in the commit hooks and on every change, through the check.
**Why:** a committed secret is readable by everyone who ever clones the repository, long after it is deleted.
**Check:** tool — secrets
**Tags:** security

## secret-never-in-url-or-artefact · MUST
A secret never travels in a URL, and never reaches a build artefact: an image layer, a client bundle, a variable baked in at build time.
**Why:** URLs are logged by every proxy and browser, and whatever ships in an artefact is readable by whoever receives it.
**Check:** review
**Tags:** security

## leaked-secret-rotated-at-once · MUST
A secret that leaked — into a commit, a log, a message — is rotated at once, and the access made with it while it was exposed is checked.
**Why:** a leaked secret is compromised whether or not the leak is undone, and only its access log says whether it was used.
**Check:** review
**Tags:** security

## no-secret-or-personal-data-in-output · MUST
No secret and no personal data appear in logs, errors, test data or documents. An error carries identifiers, not the values it rejected.
**Why:** output is copied to places with weaker access than the data it came from.
**Check:** review
**Tags:** security, data

## environment-names-declared-in-one-place · SHOULD
Every environment variable the program reads is declared in one place, and code reads only declared names. The local environment file is ignored by version control; its committed example carries placeholders only.
**Why:** one declaration shows what a deployment must provide, and a real value never lands in the example.
**Check:** review
**Tags:** security

## least-privilege-credentials · SHOULD
A credential belongs to one identity and one purpose, per environment, with only the permissions its job needs, documented beside its use. Access is granted to people and services, never through a shared credential.
**Why:** a narrow credential limits what a leak can do, and one identity per credential says who did what.
**Check:** review
**Tags:** security

## Dependencies

## dependencies-pinned-by-lockfile · MUST
A language uses one package manager, and one lockfile, committed. Installs, in CI and locally, follow the lockfile exactly and fail when it drifts from the manifest.
**Why:** two package managers resolve differently, and an install that ignores the lockfile runs code nobody reviewed.
**Check:** review
**Tags:** security

## ci-steps-pinned-to-immutable-references · MUST
A third-party step of CI is pinned to an immutable reference, never to a moving tag or branch.
**Why:** a moving reference lets its owner, or an attacker who owns it, change the code the pipeline runs with its secrets.
**Check:** review
**Tags:** security

## dependencies-updated-by-bot · SHOULD
Dependency updates arrive as pull requests from an update bot, each passing the check before it is merged.
**Why:** updates that arrive on their own, small and checked, keep the project current without a risky update all at once.
**Check:** review
**Tags:** security, workflow

## dependency-release-cooldown · SHOULD
A new release of a dependency is adopted only after a cooldown of some days, except a fix for a known vulnerability.
**Why:** most hijacked releases are found and pulled within days; waiting lets others find them first.
**Check:** review
**Tags:** security

## new-dependency-vetted · SHOULD
A new dependency is a decision: it needs a reason it cannot be a few lines of the project's own, and it is checked against the risk signs of a new package — a name one typo from a popular one, younger than thirty days, under a hundred weekly downloads, a recent change of owner, no source repository, obfuscated code.
**Why:** each dependency is code the project runs with its own rights, and these signs mark most malicious packages.
**Check:** review
**Tags:** security

## deprecated-packages-replaced · SHOULD
A dependency deprecated as a whole is replaced — by its successor, another package, or the project's own code.
**Why:** a deprecated package gets no more fixes, so its next vulnerability stays open.
**Check:** review
**Tags:** security
**Implements:** `new-dependency-vetted`

## install-scripts-only-for-listed-dependencies · MUST
A dependency's install scripts run only when the dependency is listed by name as allowed to run them.
**Why:** an install script runs with the developer's rights before anyone reviews what it does.
**Check:** review
**Tags:** security

## known-vulnerabilities-fail-the-check · MUST
A known vulnerability of any severity in any dependency, development dependencies included, fails the check. An accepted one is recorded in the audit configuration with its reason and an expiry.
**Why:** a vulnerability found by the check is fixed before release; one accepted without an expiry is accepted forever.
**Check:** tool — audit
**Tags:** security

## licences-from-an-allowlist · MUST
Every dependency's licence is on the project's allowlist.
**Why:** a licence the project cannot honour is a legal obligation it took on without knowing.
**Check:** tool — audit
**Tags:** security

## shared-tooling-from-pinned-packages · SHOULD
Commit hooks, linter configurations and release automation come from shared, pinned packages, not from copies in each repository.
**Why:** a copy drifts and is fixed in one repository at a time; a shared package is fixed once and adopted by an update.
**Check:** review
**Tags:** security, workflow

## Operations and access

## irreversible-operations-behind-flag-and-human · MUST
An operation that destroys data, spends money, touches a live system or sends something outward runs only with an explicit flag and a person's go-ahead; its default is to show what it would do.
**Why:** an irreversible operation run by mistake cannot be undone by a better test.
**Check:** review
**Tags:** security, ux

## access-denied-unless-granted · MUST
Access is denied unless a rule grants it. Every entry point declares its access, and a test proves each one does.
**Why:** an entry point that forgets to declare its access is open by default, and only a test notices the one that forgot.
**Check:** test
**Tags:** security
