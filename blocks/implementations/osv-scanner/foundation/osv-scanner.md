# OSV-Scanner

## vulnerabilities-scanned-in-the-check → known-vulnerabilities-fail-the-check
The check runs `osv-scanner scan source` over every lockfile of the repository, each named with `-L`, development dependencies included.

| Why | Check | Tags |
|---|---|---|
| a vulnerability found by the check is dealt with before release, in every language the same way; a walk of the tree honours the repository's ignore files, so in a checkout nested in an ignored folder — an agent's worktree — it finds no lockfile, while a named one is read wherever the checkout lies. | tool/audit | [] |

## licences-checked-against-the-shared-allowlist → licences-from-an-allowlist
The same run passes the allowlist of the constitution's release archive as `--licenses`, so a licence that is not on it fails the check.

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
