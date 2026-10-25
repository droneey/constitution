# Dockerfile

> Governs the images the project builds, scanned beside the lockfiles.

## General

### images-scanned-in-the-check → dependency-free-of-known-vulnerabilities · MUST

OSV-Scanner reads each image the project builds from a Dockerfile, so a known vulnerability in an image's system packages is a finding like one in a lockfile.

| Why |
|---|
| a lockfile names only the program's own dependencies; the base image brings a system — `openssl`, `glibc` — with vulnerabilities of its own. |
