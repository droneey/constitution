# Vulnerabilities

> Governs the scan of every lockfile for known vulnerabilities, the flag every scan runs with, and a vulnerability accepted.

## General

### every-lockfile-scanned-for-vulnerabilities → known-vulnerability-reported-by-the-check · MUST

OSV-Scanner reads every lockfile of the repository. It reads them in every language, development dependencies included, so it reports each known vulnerability in any of them.

| Why |
|---|
| a lockfile the scanner skips ships its known vulnerabilities unseen, and a language checked some other way, or not at all, is held to another bar. |

### osv-scan-run-with-all-vulns → known-vulnerability-reported-by-the-check · MUST

Every OSV-Scanner scan runs with `--all-vulns`, the scan of an image included.

| Why |
|---|
| without `--all-vulns` the scan neither reports nor fails on the vulnerabilities it judges unimportant or never called, so a change that brings only those passes the check unseen. |

### accepted-vulnerability-held-as-an-ignored-entry → dependency-free-of-known-vulnerabilities · MUST

Every accepted vulnerability is an `[[IgnoredVulns]]` entry with its `id`, its `reason` and an `ignoreUntil` date. The entry sits in the `osv-scanner.toml` beside the lockfile it concerns or, for an image, in the `osv-scanner.toml` its scan is given with `--config`.

| Why |
|---|
| an acceptance without a reason cannot be argued, one without a date is never looked at again, so it outlives the fix that would end it, and an entry in another folder's file accepts nothing, since a lockfile's scan reads only the file beside it, and an image's only the one it is given. |
