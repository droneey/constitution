# osv-scanner with Docker

> Images scanned beside the lockfiles.

### images-scanned-in-the-check → known-vulnerabilities-fail-the-check
OSV-Scanner reads each image the project builds or pulls, so a known vulnerability in an image's system packages is a finding like one in a lockfile.

| Why | Tags |
|---|---|
| a lockfile names only the program's own dependencies; the base image brings a system — `openssl`, `glibc` — with vulnerabilities of its own. | [security] |
