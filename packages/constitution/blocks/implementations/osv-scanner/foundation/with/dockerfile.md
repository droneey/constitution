# Dockerfile

> Governs the images the project builds, scanned beside the lockfiles.

## General

### images-scanned-in-the-check → dependency-free-of-known-vulnerabilities · MUST

OSV-Scanner reads each image the project builds from a Dockerfile, at its `base` stage. A Dockerfile names `base` the stage that holds the system its image runs on — the base image and the system packages — and the stage it ships builds on it; a known vulnerability in an image's system packages is then a finding like one in a lockfile, and their licences are not checked.

| Why |
|---|
| a lockfile names only the program's own dependencies, while the base image brings a system, such as `openssl` and `glibc`, with vulnerabilities of its own that go unseen unless the image is read; the stage that holds it builds without the program, so the check stays quick, and the allowlist does not reach the system an image runs on. |
