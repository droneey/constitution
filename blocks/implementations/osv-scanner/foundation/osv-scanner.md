# OSV-Scanner

## vulnerabilities-scanned-in-the-check · MUST
The check runs `osv-scanner scan source` over the repository, development dependencies included.
**Why:** a vulnerability found by the check is dealt with before release, in every language the same way.
**Check:** tool — audit
**Tags:** security
**Implements:** `known-vulnerabilities-fail-the-check`

## licences-checked-against-devkit-allowlist · MUST
The same run passes devkit's allowlist as `--licenses`, so a licence that is not on it fails the check.
**Why:** one list, versioned with devkit, says which licences every repository accepts.
**Check:** tool — audit
**Tags:** security
**Implements:** `licences-from-an-allowlist`

## accepted-vulnerability-states-reason-and-expiry · MUST
An accepted vulnerability is an `[[IgnoredVulns]]` entry in `osv-scanner.toml` with its `reason` and an `ignoreUntil` date.
**Why:** an acceptance with a reason can be argued, and one with an expiry is looked at again.
**Check:** review
**Tags:** security
**Implements:** `known-vulnerabilities-fail-the-check`

## licence-override-states-its-reason · MUST
A package whose licence the registry names wrongly is a `[[PackageOverrides]]` entry with `license.override` and its `reason`. A licence that is not on the allowlist is never overridden to pass.
**Why:** an override corrects the data; used to let a licence through, it hides an obligation the project took on.
**Check:** review
**Tags:** security
**Implements:** `licences-from-an-allowlist`
