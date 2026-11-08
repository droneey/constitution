# Dependencies

> Governs the base images, local files, downloads and system packages an image is built from.

## Vocabulary

A **build stage** is one `FROM` of the file with the instructions after it, up to the next `FROM`; a build stage is never a value's stage, as core's types chapter means one.

## Base images

### base-image-pinned-to-its-full-version → download-pinned-to-its-version · MUST

Every `FROM` names its image's full version, `major.minor.patch` where the image has one, never `latest` or a floating major or minor. It holds for an image a build argument gives the `FROM`, by its default or by a value the build passes. Exempt: `FROM scratch`, and a `FROM` that names an earlier build stage.

| Why |
|---|
| a `FROM` is the first download of every build, so one that a moving tag names builds whatever the tag points at that day, and two builds of one commit ship different images. |

### base-image-checked-against-its-digest → download-checked-against-its-digest · MUST

Every `FROM` names its image's digest beside its version, as `image:x.y.z@sha256:<digest>`. It holds for an image a build argument gives the `FROM`, by its default or by a value the build passes. Exempt: `FROM scratch`, and a `FROM` that names an earlier build stage.

| Why |
|---|
| a tag can be moved to another image by whoever controls the registry, and only the digest makes the builder refuse an image other than the one reviewed. |

## Local files

### files-copied-never-added · MUST

No Dockerfile uses `ADD`. Local files and folders enter an image by `COPY`.

| Why |
|---|
| `ADD` also fetches addresses and unpacks archives, unseen, so a line that reads as a copy can bring into the image what nobody checked, while `COPY` does one visible thing. |

## Downloads

### download-checked-in-the-step-that-fetches-it → download-checked-against-its-digest · MUST

Every file a build downloads is fetched in a `RUN` step that checks it against its digest.

| Why |
|---|
| a download checked in a later step, or never, leaves an unchecked file in the image's history, while one `RUN` step shows the version, the digest and the check in one place. |

## System packages

### system-package-pinned-to-its-version · MUST

Every system package an image installs is pinned to its version.

| Why |
|---|
| an unpinned package changes between two builds of the same source, so the image that ships is not the one that was tested. |

### system-package-step-keeps-only-what-the-image-uses · MUST

Every `RUN` step that installs system packages installs only those the image uses, never the optional extras its package manager adds.

| Why |
|---|
| every extra package is size and code to attack that the program never uses. |

### package-index-removed-in-the-step-that-fetched-it · MUST

Every `RUN` step that fetches a system package index removes it before the step ends.

| Why |
|---|
| a cached index is size the program never uses, and one removed in a later step still ships in the image's history. |
