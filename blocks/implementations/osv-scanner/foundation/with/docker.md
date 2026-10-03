# osv-scanner with Docker

> Images scanned beside the lockfiles.

## images-scanned-in-the-check → known-vulnerabilities-fail-the-check
The check scans each image the project builds or pulls with `osv-scanner scan image`, so a known vulnerability in an image's system packages fails the check like one in a lockfile.

| Why | Check | Tags |
|---|---|---|
| a lockfile names only the program's own dependencies; the base image brings a system — `openssl`, `glibc` — with vulnerabilities of its own. | review | [security] |
