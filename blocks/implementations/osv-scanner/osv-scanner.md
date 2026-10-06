---
id: osv-scanner
summary: Checks the lockfiles for known vulnerabilities and licences.
requires: []
extends: null
abstract: false
languages: []
dictionary: [OSV-Scanner, osv-scanner, osv-scanner.toml]
governs: ["osv-scanner.toml"]
---

# OSV-Scanner

> Checks the dependencies of any language by their lockfiles against the OSV database, and their licences against the shared allowlist, which the constitution's release archive carries as `presets/common/osv-scanner/core.txt`. It holds every active rule on known vulnerabilities and licences. It has no severity floor: any known vulnerability is a finding.

### every-lockfile-scanned-for-vulnerabilities → dependency-free-of-known-vulnerabilities
OSV-Scanner reads every lockfile of the repository, in every language, development dependencies included, and a known vulnerability of any severity in any of them is a finding.

| Why | Tags |
|---|---|
| a vulnerability is then dealt with before release, in every language the same way. | [] |

### licences-checked-against-the-shared-allowlist → dependency-licence-on-the-allowlist
OSV-Scanner checks every licence against the allowlist of the constitution's release archive, so a licence that is not on it is a finding.

| Why | Tags |
|---|---|
| one list, versioned with the constitution, says which licences every repository accepts. | [] |

### accepted-vulnerability-states-reason-and-expiry → dependency-free-of-known-vulnerabilities
An accepted vulnerability is an `[[IgnoredVulns]]` entry in `osv-scanner.toml` with its `reason` and an `ignoreUntil` date.

| Why | Tags |
|---|---|
| an acceptance with a reason can be argued, and one with an expiry is looked at again. | [] |

### licence-override-states-its-reason → dependency-licence-on-the-allowlist
A package whose licence the registry names wrongly is a `[[PackageOverrides]]` entry with `license.override` and its `reason`. A licence that is not on the allowlist is never overridden to pass.

| Why | Tags |
|---|---|
| an override corrects the data; used to let a licence through, it hides an obligation the project took on. | [] |

### development-tool-licence-ignored-with-reason → dependency-licence-on-the-allowlist
A tool that only builds, tests or checks the program and whose licence is off the allowlist is a `[[PackageOverrides]]` entry by name with `license.ignore = true` and a `reason` saying it never ships.

| Why | Tags |
|---|---|
| the scanner then skips its licence and still checks its vulnerabilities, and the reason is the only record that it never ships. | [] |
