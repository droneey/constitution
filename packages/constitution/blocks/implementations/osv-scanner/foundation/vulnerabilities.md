# Vulnerabilities

> Governs the scan of every lockfile for known vulnerabilities, and a vulnerability accepted.

## General

### every-lockfile-scanned-for-vulnerabilities → dependency-free-of-known-vulnerabilities · MUST

OSV-Scanner reads every lockfile of the repository, in every language, development dependencies included, and a known vulnerability of any severity in any of them is a finding.

| Why |
|---|
| a vulnerability is then dealt with before release, in every language the same way. |

### accepted-vulnerability-states-reason-and-expiry → dependency-free-of-known-vulnerabilities · MUST

An accepted vulnerability is an `[[IgnoredVulns]]` entry in **`osv-scanner.toml`** with its `reason` and an `ignoreUntil` date.

| Why |
|---|
| an acceptance with a reason can be argued, and one with an expiry is looked at again. |
