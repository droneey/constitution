# Licences

> Governs the check of the dependencies' licences against the shared allowlist, and its exceptions.

## General

### licences-checked-against-the-shared-allowlist → dependency-licence-on-the-allowlist · MUST

OSV-Scanner checks every dependency's licence against the shared allowlist. The dependencies are those a lockfile names and the allowlist is the one the Constitution's distribution ships, so a licence that is not on it is a finding.

| Why |
|---|
| a list kept in each repository drifts, so one repository ships a licence another refuses and nobody sees the gap — a single source of truth. |

### licence-override-states-its-reason → dependency-licence-on-the-allowlist · MUST

A licence exception is a `[[PackageOverrides]]` entry by name, with its `reason`. It takes one of two forms: `license.override` for a package whose licence the registry names wrongly, never for a licence off the allowlist, and `license.ignore = true` for a tool that only builds, tests or checks the program, whose reason says it never ships.

| Why |
|---|
| an override corrects the data, and used to let a licence through it hides an obligation the project took on; an ignore without the reason that the tool never ships cannot be told from such a pass, and `license.ignore` skips only the licence, so the tool's vulnerabilities are still checked. |
