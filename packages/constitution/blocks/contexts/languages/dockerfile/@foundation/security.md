# Security

> Governs an image's security: the user it runs as, the secrets its build takes and the context its build is sent.

## Vocabulary

The **build context filter** is the file that names what a build keeps out of the context it sends the builder, spelled **`.dockerignore`**{#build-context-filter}.

## Users

### image-user-is-a-numeric-unprivileged-id → process-runs-with-only-the-rights-its-job-needs · MUST

Every image's last build stage sets `USER` to the numeric id of an unprivileged user.

| Why |
|---|
| a process that runs as root inside a container turns any flaw of the program into control of the container, and a misconfigured one into control of the host, while only a numeric id can be verified as not root before the process starts — least privilege. |

## Secrets

### secrets-never-baked-into-images → secret-kept-out-of-output · MUST

Every secret a build uses reaches only the step that reads it, through a mount the builder offers for secrets. It never reaches the build through `ARG`, `ENV` or a copied file, and `RUN --mount=type=secret` is one such mount.

| Why |
|---|
| a build argument, a variable and a copied file stay in the image and its history, readable by whoever pulls it. |

## Build context

### build-context-trimmed · SHOULD

Every build context leaves out the installed dependencies and the build output that no step of its build copies. Its build context filter keeps them out.

| Why |
|---|
| the context is sent whole to the builder, and every needless file slows each build. |

### build-context-keeps-out-what-can-hold-a-secret · MUST

Every build context leaves out the files of version control and the environment-variable files kept for one machine. Its build context filter keeps them out.

| Why |
|---|
| a step that copies the whole context, such as `COPY . .`, puts an environment-variable file and the repository's history into the image, and the secrets they hold are readable by whoever pulls it. |
