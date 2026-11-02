# Vulnerabilities

> Governs the scan of every lockfile for known vulnerabilities, and a vulnerability accepted.

## General

### every-lockfile-scanned-for-vulnerabilities → dependency-free-of-known-vulnerabilities · MUST

OSV-Scanner reads every lockfile of the repository. It reads them in every language, development dependencies included, and a known vulnerability of any severity in any of them is a finding.

| Why |
|---|
| a lockfile the scanner skips ships its known vulnerabilities unseen, and a language checked some other way, or not at all, is held to another bar. |

### accepted-vulnerability-states-reason-and-expiry → dependency-free-of-known-vulnerabilities · MUST

An accepted vulnerability is an `[[IgnoredVulns]]` entry in **`osv-scanner.toml`** with its `reason` and an `ignoreUntil` date.

| Why |
|---|
| an acceptance without a reason cannot be argued, and one without an expiry is never looked at again, so it outlives the fix that would end it. |
