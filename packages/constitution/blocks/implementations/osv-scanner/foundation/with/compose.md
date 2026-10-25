# Docker Compose

> Governs the images a Compose file pulls, scanned beside the lockfiles.

## General

### pulled-images-scanned-in-the-check → dependency-free-of-known-vulnerabilities · MUST

OSV-Scanner reads each image a Compose file runs that the project does not build, so a known vulnerability in its system packages is a finding like one in a lockfile.

| Why |
|---|
| an image pulled as it is published — a database, a broker — runs beside the program with a system of its own, which no lockfile of the project names. |
