# Dockerfile

> Governs the images the project builds, scanned beside the lockfiles, and the build stage the scan reads.

## General

### built-image-scanned-at-its-base-stage → known-vulnerability-reported-by-the-check · MUST

OSV-Scanner reads each image the project builds from a Dockerfile, built to its `base` stage. It reads the image's system packages, so it reports each known vulnerability in them as it reports one in a lockfile.

#### Why

A lockfile names only the program's own dependencies, while the base image brings a system, such as `openssl` and `glibc`, with vulnerabilities of its own that go unseen unless the image is read, and the allowlist does not reach the system an image runs on.

#### Examples

```bash title="Avoid"
osv-scanner scan source --all-vulns --recursive .
```

```bash title="Prefer"
docker build --target base --tag shop-api:base apps/api
osv-scanner scan image --all-vulns shop-api:base
osv-scanner scan source --all-vulns --recursive .
```

### system-stage-named-base · MUST

Every Dockerfile's stage that holds the system its image runs on is named `base`. That stage holds the base image and its system packages, and the build stage the image ships builds on it.

#### Why

The scan builds the image to the stage named `base`, so a Dockerfile without one fails the check, and one whose `base` stage is not the one its image builds on scans a system other than the one it ships; the stage builds without the program, so the check stays quick.

#### Examples

```dockerfile title="Avoid"
FROM node:22.11.0-bookworm-slim@sha256:66abef25028edbf19b3e6fa5d293a19adfdfe6cc2e8fd9ca7392c3f6f0c64615 AS runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates=20230311+deb12u1 \
 && rm -rf /var/lib/apt/lists/*

FROM runtime
COPY --from=build /app/dist ./dist
USER 1000:1000
```

```dockerfile title="Prefer"
FROM node:22.11.0-bookworm-slim@sha256:66abef25028edbf19b3e6fa5d293a19adfdfe6cc2e8fd9ca7392c3f6f0c64615 AS base
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates=20230311+deb12u1 \
 && rm -rf /var/lib/apt/lists/*

FROM base
COPY --from=build /app/dist ./dist
USER 1000:1000
```
