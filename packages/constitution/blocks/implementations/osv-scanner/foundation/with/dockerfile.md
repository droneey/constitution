# Dockerfile

> Governs the images the project builds, scanned beside the lockfiles.

## General

### images-scanned-in-the-check → dependency-free-of-known-vulnerabilities · MUST

A Dockerfile names `base` the stage that holds the system its image runs on — the base image and the system packages — and the stage it ships builds on it. OSV-Scanner reads each image the project builds from a Dockerfile at that stage, so a known vulnerability in an image's system packages is a finding like one in a lockfile; their licences are not checked.

| Why |
|---|
| a lockfile names only the program's own dependencies; the base image brings a system — `openssl`, `glibc` — with vulnerabilities of its own, and the stage that holds it builds without the program, so the check stays quick; the allowlist does not reach the system an image runs on. |
