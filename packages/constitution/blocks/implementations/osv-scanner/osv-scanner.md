---
id: osv-scanner
summary: Checks the lockfiles for known vulnerabilities and licences.
requires: [toml]
extends: null
abstract: false
languages: []
dictionary: [OSV-Scanner, osv-scanner, osv-scanner.toml]
governs: ["osv-scanner.toml"]
---

# OSV-Scanner

> Checks the dependencies of any language by their lockfiles against the OSV database, and their licences against the shared allowlist.

The allowlist is a part of one licence to a line, which the scan takes on the command line. OSV-Scanner holds every active rule on known vulnerabilities and licences. It has no severity floor: any known vulnerability is a finding.
