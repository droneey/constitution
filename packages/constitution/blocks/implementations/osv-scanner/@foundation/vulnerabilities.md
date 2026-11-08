# Vulnerabilities

> Governs the scan of every lockfile for known vulnerabilities, the flag every scan runs with, and a vulnerability accepted.

## General

### every-lockfile-scanned-for-vulnerabilities → known-vulnerability-reported-by-the-check · MUST

OSV-Scanner reads every lockfile of the repository. It reads them in every language, development dependencies included, so it reports each known vulnerability in any of them.

#### Why

A lockfile the scanner skips ships its known vulnerabilities unseen, and a language checked some other way, or not at all, is held to another bar.

#### Examples

```bash title="Avoid"
osv-scanner scan source --all-vulns --lockfile bun.lock
```

```bash title="Prefer"
osv-scanner scan source --all-vulns --recursive .
```

### osv-scan-run-with-all-vulns → known-vulnerability-reported-by-the-check · MUST

Every OSV-Scanner scan runs with `--all-vulns`, the scan of an image included.

#### Why

Without `--all-vulns` the scan neither reports nor fails on the vulnerabilities it judges unimportant or never called, so a change that brings only those passes the check unseen.

#### Examples

```bash title="Avoid"
osv-scanner scan source --recursive .
osv-scanner scan image shop-api:base
```

```bash title="Prefer"
osv-scanner scan source --all-vulns --recursive .
osv-scanner scan image --all-vulns shop-api:base
```

### accepted-vulnerability-held-as-an-ignored-entry → dependency-free-of-known-vulnerabilities · MUST

Every accepted vulnerability is an `[[IgnoredVulns]]` entry with its `id`, its `reason` and an `ignoreUntil` date. The entry sits in the `osv-scanner.toml` beside the lockfile it concerns or, for an image, in the `osv-scanner.toml` its scan is given with `--config`.

#### Why

An acceptance without a reason cannot be argued, one without a date is never looked at again, so it outlives the fix that would end it, and an entry in another folder's file accepts nothing, since a lockfile's scan reads only the file beside it, and an image's only the one it is given.

#### Examples

```toml title="Avoid"
# osv-scanner.toml
[[IgnoredVulns]]
id = "GHSA-9wv6-86v2-598j"
```

```toml title="Prefer"
# apps/api/osv-scanner.toml
[[IgnoredVulns]]
id = "GHSA-9wv6-86v2-598j"
ignoreUntil = 2026-12-31T00:00:00Z
reason = "path-to-regexp is reached only by the dev server, which never faces a network"
```
