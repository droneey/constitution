# OSV-Scanner

## vulnerabilities-scanned-in-the-check → known-vulnerabilities-fail-the-check
The check runs `osv-scanner scan source` over the repository, development dependencies included.

| Why | Check | Tags |
|---|---|---|
| a vulnerability found by the check is dealt with before release, in every language the same way. | tool — audit | [] |

## licences-checked-against-the-shared-allowlist → licences-from-an-allowlist
The same run passes the allowlist of the constitution's release archive as `--licenses`, so a licence that is not on it fails the check.

| Why | Check | Tags |
|---|---|---|
| one list, versioned with the constitution, says which licences every repository accepts. | tool — audit | [] |

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
