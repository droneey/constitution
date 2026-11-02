# Dependencies

> Governs the base images, local files, downloads and system packages an image is built from.

## Base images

### images-pinned-by-version-and-digest → download-pinned-by-version-and-checksum · MUST

Every `FROM` names its image as `image:x.y.z@sha256:<digest>`. The version is `major.minor.patch` where the image has one, never `latest` or a floating major or minor.

| Why |
|---|
| a `FROM` is the first download of every build, so one that a tag names builds whatever the tag points at that day, and two builds of one commit ship different images. |

## Local files

### files-copied-never-added · MUST

No Dockerfile uses `ADD`. Local files and folders enter an image with `COPY`.

| Why |
|---|
| `ADD` also fetches addresses and unpacks archives, unseen, so a line that reads as a copy can bring into the image what nobody checked, while `COPY` does one visible thing. |

## Downloads

### downloads-verified-archives-unpacked → download-pinned-by-version-and-checksum · MUST

A file from the network is downloaded in a `RUN` step that checks its checksum. An archive is unpacked there with `tar`.

| Why |
|---|
| a download made any other way is checked against no checksum, or unpacked unseen, while a `RUN` step shows the version, the checksum and the unpacking in one place. |

## System packages

### system-packages-pinned-and-lean · MUST

A system package is installed at a pinned version, without recommended extras. The package index is removed in the same layer.

| Why |
|---|
| an unpinned package changes between two builds of the same source, and every extra package and cached index is size and code to attack that the program never uses. |
