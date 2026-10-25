# Dependencies

> Governs the base images, local files, downloads and system packages an image is built from.

## Base images

### images-pinned-by-version-and-digest → download-pinned-by-version-and-checksum · MUST

Every `FROM` names its image by the most specific version the image is published under — `major.minor.patch` where it has one — and its digest, `image:x.y.z@sha256:<digest>`; never `latest`, never a floating major or minor, never a tag alone and never a digest alone.

| Why |
|---|
| any tag, a patch's included, can be pushed again under the same name, so only the digest fixes what runs; the version beside it tells a reader and an updater which release the digest is. |

## Local files

### files-copied-never-added · MUST

No Dockerfile uses `ADD`: local files and folders enter an image with `COPY`.

| Why |
|---|
| `COPY` does one visible thing; `ADD` also fetches addresses and unpacks archives, unseen. |

## Downloads

### downloads-verified-archives-unpacked → download-pinned-by-version-and-checksum · MUST

A file from the network is downloaded in a `RUN` step that checks its checksum, and an archive is unpacked with `tar`.

| Why |
|---|
| a `RUN` step shows the version, the checksum and the unpacking in one place. |

## System packages

### system-packages-pinned-and-lean · MUST

A system package is installed at a pinned version, without recommended extras, and the package index is removed in the same layer.

| Why |
|---|
| an unpinned package changes between two builds of the same source, and every extra package and cached index is size and code to attack that the program never uses. |
