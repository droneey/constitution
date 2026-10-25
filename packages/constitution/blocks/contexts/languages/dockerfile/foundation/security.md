# Security

> Governs the user an image runs as, the secrets its build takes and the context its build is sent.

## Users

### image-runs-as-non-root → process-runs-with-only-the-rights-its-job-needs · MUST

The final stage of an image sets `USER` to the numeric id of an unprivileged user.

| Why |
|---|
| a process that runs as root inside a container turns any flaw of the program into control of the container, and a misconfigured one into control of the host; only a numeric id can be verified as not root before the process starts. |

## Secrets

### secrets-never-baked-into-images → secret-and-personal-data-kept-out-of-output · MUST

A build takes a secret through a secret mount, `RUN --mount=type=secret`, never through `ARG`, `ENV` or a copied file.

| Why |
|---|
| a build argument, a variable and a copied file stay in the image's layers and history, readable by whoever pulls it. |

## Build context

### build-context-trimmed · SHOULD

`.dockerignore` leaves out version control, dependencies, local environment files and build output.

| Why |
|---|
| the context is sent whole to the builder; a local environment file in it can end up in a layer, and every needless file slows each build. |
