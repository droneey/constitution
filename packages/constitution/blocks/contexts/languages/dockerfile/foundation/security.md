# Security

> Governs an image's security: the user it runs as, the secrets its build takes and the context its build is sent.

## Users

### image-runs-as-non-root → process-runs-with-only-the-rights-its-job-needs · MUST

An image's final stage runs as an unprivileged user. It sets `USER` to that user's numeric id.

| Why |
|---|
| a process that runs as root inside a container turns any flaw of the program into control of the container, and a misconfigured one into control of the host; only a numeric id can be verified as not root before the process starts — least privilege. |

## Secrets

### secrets-never-baked-into-images → secret-kept-out-of-output · MUST

A build takes a secret only through a secret mount. It takes one by `RUN --mount=type=secret`, never through `ARG`, `ENV` or a copied file.

| Why |
|---|
| a build argument, a variable and a copied file stay in the image's layers and history, readable by whoever pulls it. |

## Build context

### build-context-trimmed · SHOULD

The build context leaves out what the image never needs. `.dockerignore` leaves out version control, dependencies, local environment files and build output.

| Why |
|---|
| the context is sent whole to the builder; a local environment file in it can end up in a layer, and every needless file slows each build. |
