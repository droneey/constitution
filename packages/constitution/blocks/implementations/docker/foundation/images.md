# Images

> Governs a Dockerfile and the image it builds.

## What enters the image

### images-pinned-by-version-and-digest → download-pinned-by-version-and-checksum · MUST

A base image in a Dockerfile, an image in a Compose file and an image a script runs name the most specific version the image is published under — `major.minor.patch` where it has one — and its digest, `image:x.y.z@sha256:<digest>`; never `latest`, never a floating major or minor, never a tag alone and never a digest alone.

| Why | Tags |
|---|---|
| any tag, a patch's included, can be pushed again under the same name, so only the digest fixes what runs; the version beside it tells a reader and an updater which release the digest is. | [security] |

### files-copied-never-added · MUST

No Dockerfile uses `ADD`: local files and folders enter an image with `COPY`.

| Why | Tags |
|---|---|
| `COPY` does one visible thing; `ADD` also fetches addresses and unpacks archives, unseen. | [security] |

### downloads-verified-archives-unpacked → download-pinned-by-version-and-checksum · MUST

A file from the network is downloaded in a `RUN` step that checks its checksum, and an archive is unpacked with `tar`.

| Why | Tags |
|---|---|
| a `RUN` step shows the version, the checksum and the unpacking in one place. | [security] |

### system-packages-pinned-and-lean · MUST

A system package is installed at a pinned version, without recommended extras, and the package index is removed in the same layer.

| Why | Tags |
|---|---|
| an unpinned package changes between two builds of the same source, and every extra package and cached index is size and code to attack that the program never uses. | [security, performance] |

### build-context-trimmed · SHOULD

`.dockerignore` leaves out version control, dependencies, local environment files and build output.

| Why | Tags |
|---|---|
| the context is sent whole to the builder; a local environment file in it can end up in a layer, and every needless file slows each build. | [security, performance] |

## Instructions

### commands-in-exec-form · MUST

`CMD` and `ENTRYPOINT` use the JSON exec form, `["node", "main.js"]`.

| Why | Tags |
|---|---|
| in the shell form a shell is the first process and swallows the stop signal, so every stop waits for the kill timeout. | [errors] |

### shell-steps-fail-on-any-error · MUST

A `RUN` that pipes sets `-o pipefail` through `SHELL`.

| Why | Tags |
|---|---|
| without it a failing command before a pipe leaves a broken layer that the build reports as built. | [errors] |

## Security

### image-runs-as-non-root · MUST

The final stage of an image sets `USER` to the numeric id of an unprivileged user.

| Why | Tags |
|---|---|
| a process that runs as root inside a container turns any flaw of the program into control of the container, and a misconfigured one into control of the host; only a numeric id can be verified as not root before the process starts. | [security] |

### secrets-never-baked-into-images → secret-and-personal-data-kept-out-of-output · MUST

A build takes a secret through a secret mount, `RUN --mount=type=secret`, never through `ARG`, `ENV` or a copied file.

| Why | Tags |
|---|---|
| a build argument, a variable and a copied file stay in the image's layers and history, readable by whoever pulls it. | [] |
