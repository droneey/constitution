---
id: osv-scanner
summary: Finds vulnerabilities in lockfiles and images, licences in lockfiles.
requires: [task-runner]
languages: []
governs: ["osv-scanner.toml"]
---

# OSV-Scanner

> OSV-Scanner, the `osv-scanner` command, checks the dependencies of any language by their lockfiles against the OSV database, and their licences against the project's allowlist.

The allowlist of licences is the scan's option on the command line, in the audit task `constitution` writes. The scan exits with an error on any licence off the allowlist and any vulnerability it finds, whatever its severity, save that, without `--all-vulns`, a scan whose vulnerabilities are all unimportant or never called exits without one; with the flag they are reported and fail it. An `osv-scanner.toml` applies to the lockfiles of its own folder, never to those of the folders below it.
