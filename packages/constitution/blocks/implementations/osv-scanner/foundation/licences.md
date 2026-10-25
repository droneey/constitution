# Licences

> Governs the check of the dependencies' licences against the shared allowlist, and its exceptions.

## General

### licences-checked-against-the-shared-allowlist → dependency-licence-on-the-allowlist · MUST

OSV-Scanner checks every licence against the allowlist of the Constitution's release archive, so a licence that is not on it is a finding.

| Why |
|---|
| one list, versioned with the Constitution, says which licences every repository accepts. |

### licence-override-states-its-reason → dependency-licence-on-the-allowlist · MUST

A package whose licence the registry names wrongly is a `[[PackageOverrides]]` entry with `license.override` and its `reason`. A licence that is not on the allowlist is never overridden to pass.

| Why |
|---|
| an override corrects the data; used to let a licence through, it hides an obligation the project took on. |

### development-tool-licence-ignored-with-reason → dependency-licence-on-the-allowlist · MUST

A tool that only builds, tests or checks the program and whose licence is off the allowlist is a `[[PackageOverrides]]` entry by name with `license.ignore = true` and a `reason` saying it never ships.

| Why |
|---|
| the scanner then skips its licence and still checks its vulnerabilities, and the reason is the only record that it never ships. |
