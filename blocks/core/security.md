# Security

> Governs **how secrets, credentials, dependencies and data are handled** in every repository. The `stack` chapter names the tools; these rules hold for all.

---

## 1. Secrets are never literals
- A secret never appears in a repository, a document, a test, a fixture, a log or an error — not in code, not in configuration, not in examples.
- Every environment name a repository reads is **declared in one place** — `.env.example` for an application, the tool's own document for a tool that reads one — and the value lives in the environment. Code reads only declared names; **it never reads a variable by a name of its own invention.**
- `.env` is local and ignored. `.env.example` carries placeholders only and every name the project needs, so a newcomer sees the full list without seeing a value.

---

## 2. Least privilege
- A token is scoped to the one owner and the one set of permissions the job needs. The permissions are documented next to where the token is used, so a rotation reproduces them.
- Tokens are per purpose and per environment; one token never serves two systems.
- Access is granted to identities, not shared. A shared credential is a leak with extra steps.

---

## 3. Dependencies
- Versions are **pinned exactly**: actions and shared workflows by tag, packages by lockfile. Floating majors and moving tags are forbidden.
- Installs in CI use the lockfile and fail on drift.
- Updates arrive through the dependency bot as pull requests and pass `check` like any other change.
- A new dependency is a decision: it needs consent recorded in the change and a reason it cannot be a few lines of our own.

---

## 4. Data
- No personal data and no secret in logs, error messages, test data or documentation. Identifiers and reasons are safe context; names, addresses and tokens are not.
- An error surfaced to a user says what happened and what to do, never internals.

---

## 5. Irreversible and paid operations
Anything that destroys data, spends money, changes a live system or publishes outward is gated by an **explicit flag and a human decision**. It is never the default of a command, never triggered by a schedule a human has not chosen, and never run by an agent on its own initiative.

---

## 6. The repository's own supply chain
- Hooks, linters and release automation come from the fleet's shared packages and shared workflows, pinned, wherever the forge offers them. A repository does not carry hand-rolled copies that drift.
- The main branch is protected: pull requests only, the required check, no force pushes, no deletion.
- A public repository carries a license file at its root, with the author named; a private one need not — without a file, all rights stay reserved.
