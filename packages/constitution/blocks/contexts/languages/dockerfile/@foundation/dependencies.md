# Dependencies

> Governs the base images, local files, downloads and system packages an image is built from.

## Vocabulary

A **build stage** is one `FROM` of the file with the instructions after it, up to the next `FROM`; a build stage is never a value's stage, as core's types chapter means one.

## Base images

### base-image-pinned-to-its-full-version → download-pinned-to-its-version · MUST

Every `FROM` names its image's full version, `major.minor.patch` where the image has one, never `latest` or a floating major or minor. It holds for an image a build argument gives the `FROM`, by its default or by a value the build passes. Exempt: `FROM scratch`, and a `FROM` that names an earlier build stage.

#### Why

A `FROM` is the first download of every build, so one that a moving tag names builds whatever the tag points at that day, and two builds of one commit ship different images.

#### Examples

```dockerfile title="Avoid"
# a floating major: the tag no longer says which release was reviewed
FROM node:22-bookworm-slim@sha256:66abef25028edbf19b3e6fa5d293a19adfdfe6cc2e8fd9ca7392c3f6f0c64615
```

```dockerfile title="Prefer"
FROM node:22.11.0-bookworm-slim@sha256:66abef25028edbf19b3e6fa5d293a19adfdfe6cc2e8fd9ca7392c3f6f0c64615
```

### base-image-checked-against-its-digest → download-checked-against-its-digest · MUST

Every `FROM` names its image's digest beside its version, as `image:x.y.z@sha256:<digest>`. It holds for an image a build argument gives the `FROM`, by its default or by a value the build passes. Exempt: `FROM scratch`, and a `FROM` that names an earlier build stage.

#### Why

A tag can be moved to another image by whoever controls the registry, and only the digest makes the builder refuse an image other than the one reviewed.

#### Examples

```dockerfile title="Avoid"
FROM node:22.11.0-bookworm-slim
```

```dockerfile title="Prefer"
FROM node:22.11.0-bookworm-slim@sha256:66abef25028edbf19b3e6fa5d293a19adfdfe6cc2e8fd9ca7392c3f6f0c64615
```

## Local files

### files-copied-never-added · MUST

No Dockerfile uses `ADD`. Local files and folders enter an image by `COPY`.

#### Why

`ADD` also fetches addresses and unpacks archives, unseen, so a line that reads as a copy can bring into the image what nobody checked, while `COPY` does one visible thing.

#### Examples

```dockerfile title="Avoid"
WORKDIR /app
ADD package.json package-lock.json ./
ADD src/ ./src/
```

```dockerfile title="Prefer"
WORKDIR /app
COPY package.json package-lock.json ./
COPY src/ ./src/
```

## Downloads

### download-checked-in-the-step-that-fetches-it → download-checked-against-its-digest · MUST

Every file a build downloads is fetched in a `RUN` step that checks it against its digest.

#### Why

A download checked in a later step, or never, leaves an unchecked file in the image's history, while one `RUN` step shows the version, the digest and the check in one place.

#### Examples

```dockerfile title="Avoid"
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG RENDERER_VERSION=2.4.1
ARG RENDERER_SHA256=9f2c4e1b7a3d5f60c8e2a4b6d8f0a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5
RUN curl -fsSLo /tmp/invoice-renderer.tar.gz \
      "https://releases.example.com/invoice-renderer/v${RENDERER_VERSION}/linux-amd64.tar.gz"
# checked a step later: the unchecked file is already in the history
RUN echo "${RENDERER_SHA256}  /tmp/invoice-renderer.tar.gz" | sha256sum --check \
 && tar -xzf /tmp/invoice-renderer.tar.gz -C /usr/local/bin \
 && rm /tmp/invoice-renderer.tar.gz
```

```dockerfile title="Prefer"
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG RENDERER_VERSION=2.4.1
ARG RENDERER_SHA256=9f2c4e1b7a3d5f60c8e2a4b6d8f0a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5
RUN curl -fsSLo /tmp/invoice-renderer.tar.gz \
      "https://releases.example.com/invoice-renderer/v${RENDERER_VERSION}/linux-amd64.tar.gz" \
 && echo "${RENDERER_SHA256}  /tmp/invoice-renderer.tar.gz" | sha256sum --check \
 && tar -xzf /tmp/invoice-renderer.tar.gz -C /usr/local/bin \
 && rm /tmp/invoice-renderer.tar.gz
```

## System packages

### system-package-pinned-to-its-version · MUST

Every system package an image installs is pinned to its version.

#### Why

An unpinned package changes between two builds of the same source, so the image that ships is not the one that was tested.

#### Examples

```dockerfile title="Avoid"
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates \
      fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*
```

```dockerfile title="Prefer"
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates=20230311 \
      fonts-dejavu-core=2.37-6 \
 && rm -rf /var/lib/apt/lists/*
```

### system-package-step-keeps-only-what-the-image-uses · MUST

Every `RUN` step that installs system packages installs only those the image uses, never the optional extras its package manager adds.

#### Why

Every extra package is size and code to attack that the program never uses.

#### Examples

```dockerfile title="Avoid"
RUN apt-get update \
 && apt-get install -y \
      ca-certificates=20230311 \
      fonts-dejavu-core=2.37-6 \
 && rm -rf /var/lib/apt/lists/*
```

```dockerfile title="Prefer"
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates=20230311 \
      fonts-dejavu-core=2.37-6 \
 && rm -rf /var/lib/apt/lists/*
```

### package-index-removed-in-the-step-that-fetched-it · MUST

Every `RUN` step that fetches a system package index removes it before the step ends.

#### Why

A cached index is size the program never uses, and one removed in a later step still ships in the image's history.

#### Examples

```dockerfile title="Avoid"
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates=20230311
# the index still ships in the layer above
RUN rm -rf /var/lib/apt/lists/*
```

```dockerfile title="Prefer"
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates=20230311 \
 && rm -rf /var/lib/apt/lists/*
```
