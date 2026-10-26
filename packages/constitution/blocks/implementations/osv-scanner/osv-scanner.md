---
id: osv-scanner
summary: Checks the lockfiles for known vulnerabilities and licences.
requires: [toml, _task-runner]
extends: null
abstract: false
languages: []
governs: ["osv-scanner.toml"]
---

# OSV-Scanner

> Checks the dependencies of any language by their lockfiles against the OSV database, and their licences against the shared allowlist.

The allowlist of licences is the scan's option on the command line, in the audit task the program writes. **OSV-Scanner**, the **`osv-scanner`** command, holds every active rule on known vulnerabilities and licences. It has no severity floor: any known vulnerability is a finding.
