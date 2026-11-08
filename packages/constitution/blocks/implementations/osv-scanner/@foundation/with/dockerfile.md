# Dockerfile

> Governs the images the project builds, scanned beside the lockfiles, and the build stage the scan reads.

## General

### built-image-scanned-at-its-base-stage → known-vulnerability-reported-by-the-check · MUST

OSV-Scanner reads each image the project builds from a Dockerfile, built to its `base` stage. It reads the image's system packages, so it reports each known vulnerability in them as it reports one in a lockfile.

| Why |
|---|
| a lockfile names only the program's own dependencies, while the base image brings a system, such as `openssl` and `glibc`, with vulnerabilities of its own that go unseen unless the image is read, and the allowlist does not reach the system an image runs on. |

### system-stage-named-base · MUST

Every Dockerfile's stage that holds the system its image runs on is named `base`. That stage holds the base image and its system packages, and the build stage the image ships builds on it.

| Why |
|---|
| the scan builds the image to the stage named `base`, so a Dockerfile without one fails the check, and one whose `base` stage is not the one its image builds on scans a system other than the one it ships; the stage builds without the program, so the check stays quick. |
