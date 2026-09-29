---
id: osv-scanner
summary: Checks the lockfiles for known vulnerabilities and licences.
requires: []
extends: null
abstract: false
checks: [audit]
dictionary: [OSV-Scanner, osv-scanner, osv-scanner.toml]
governs: ["osv-scanner.toml"]
---

# OSV-Scanner

> Checks the dependencies of any language by their lockfiles against the OSV database, and their licences against the shared allowlist, which the constitution's release archive carries as `presets/osv-scanner/foundation/core.txt` and the check passes as `--licenses`. It holds every active rule whose check is `tool — audit`. It has no severity floor: any known vulnerability fails the run.
