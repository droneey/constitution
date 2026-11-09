# Docker Compose

> Governs the images a Compose file pulls, scanned beside the lockfiles.

## General

### pulled-service-image-scanned → known-vulnerability-reported-by-the-check · MUST

OSV-Scanner reads each image a Compose file runs that the project does not build. It reads the image's system packages, so it reports each known vulnerability in them as it reports one in a lockfile.

#### Why

An image pulled as it is published, such as a database or a broker, runs beside the program with a system of its own, which no lockfile of the project names, so its vulnerabilities go unseen unless the image itself is read.

#### Examples

```bash title="Avoid"
osv-scanner scan source --all-vulns --recursive .
```

```bash title="Prefer"
osv-scanner scan source --all-vulns --recursive .
osv-scanner scan image --all-vulns postgres:17.6-alpine
osv-scanner scan image --all-vulns redis:8.2-alpine
```
