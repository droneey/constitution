# OSV-Scanner

## every-lockfile-scanned-for-vulnerabilities → known-vulnerabilities-fail-the-check
OSV-Scanner reads every lockfile of the repository, in every language, development dependencies included, and a known vulnerability of any severity in any of them is a finding.

| Why | Check | Tags |
|---|---|---|
| a vulnerability is then dealt with before release, in every language the same way. | tool/audit | [] |

## licences-checked-against-the-shared-allowlist → licences-from-an-allowlist
OSV-Scanner checks every licence against the allowlist of the constitution's release archive, so a licence that is not on it is a finding.

| Why | Check | Tags |
|---|---|---|
| one list, versioned with the constitution, says which licences every repository accepts. | tool/audit | [] |

## accepted-vulnerability-states-reason-and-expiry → known-vulnerabilities-fail-the-check
An accepted vulnerability is an `[[IgnoredVulns]]` entry in `osv-scanner.toml` with its `reason` and an `ignoreUntil` date.

| Why | Check | Tags |
|---|---|---|
| an acceptance with a reason can be argued, and one with an expiry is looked at again. | review | [] |

## licence-override-states-its-reason → licences-from-an-allowlist
A package whose licence the registry names wrongly is a `[[PackageOverrides]]` entry with `license.override` and its `reason`. A licence that is not on the allowlist is never overridden to pass.

| Why | Check | Tags |
|---|---|---|
| an override corrects the data; used to let a licence through, it hides an obligation the project took on. | review | [] |

## development-tool-licence-ignored-with-reason → licences-from-an-allowlist
A tool that only builds, tests or checks the program and whose licence is off the allowlist is a `[[PackageOverrides]]` entry by name with `license.ignore = true` and a `reason` saying it never ships.

| Why | Check | Tags |
|---|---|---|
| the scanner then skips its licence and still checks its vulnerabilities, and the reason is the only record that it never ships. | review | [] |
