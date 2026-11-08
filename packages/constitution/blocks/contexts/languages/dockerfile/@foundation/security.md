# Security

> Governs an image's security: the user it runs as, the secrets its build takes and the context its build is sent.

## Vocabulary

The **build context filter** is the file that names what a build keeps out of the context it sends the builder, spelled **`.dockerignore`**{#build-context-filter}.

## Users

### image-user-is-a-numeric-unprivileged-id → process-runs-with-only-the-rights-its-job-needs · MUST

Every image's last build stage sets `USER` to the numeric id of an unprivileged user.

#### Why

A process that runs as root inside a container turns any flaw of the program into control of the container, and a misconfigured one into control of the host, while only a numeric id can be verified as not root before the process starts — least privilege.

#### Examples

```dockerfile title="Avoid"
FROM node:22.11.0-bookworm-slim@sha256:66abef25028edbf19b3e6fa5d293a19adfdfe6cc2e8fd9ca7392c3f6f0c64615
WORKDIR /app
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/orders-server.js"]
```

```dockerfile title="Prefer"
FROM node:22.11.0-bookworm-slim@sha256:66abef25028edbf19b3e6fa5d293a19adfdfe6cc2e8fd9ca7392c3f6f0c64615
WORKDIR /app
COPY --from=build /app/dist ./dist
USER 1000:1000
CMD ["node", "dist/orders-server.js"]
```

## Secrets

### secrets-never-baked-into-images → secret-kept-out-of-output · MUST

Every secret a build uses reaches only the step that reads it, through a mount the builder offers for secrets. It never reaches the build through `ARG`, `ENV` or a copied file, and `RUN --mount=type=secret` is one such mount.

#### Why

A build argument, a variable and a copied file stay in the image and its history, readable by whoever pulls it.

#### Examples

```dockerfile title="Avoid"
WORKDIR /app
COPY package.json package-lock.json ./
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc \
 && npm ci \
 && rm .npmrc
```

```dockerfile title="Prefer"
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \
    npm ci
```

## Build context

### build-context-trimmed · SHOULD

Every build context leaves out the installed dependencies and the build output that no step of its build copies. Its build context filter keeps them out.

#### Why

The context is sent whole to the builder, and every needless file slows each build.

#### Examples

```text title="Avoid"
# .dockerignore
.git
.env
.env.*
```

```text title="Prefer"
# .dockerignore
.git
.env
.env.*
node_modules
dist
coverage
```

### build-context-keeps-out-what-can-hold-a-secret · MUST

Every build context leaves out the files of version control and the environment-variable files kept for one machine. Its build context filter keeps them out.

#### Why

A step that copies the whole context, such as `COPY . .`, puts an environment-variable file and the repository's history into the image, and the secrets they hold are readable by whoever pulls it.

#### Examples

```text title="Avoid"
# .dockerignore
node_modules
dist
coverage
```

```text title="Prefer"
# .dockerignore
.git
.env
.env.*
node_modules
dist
coverage
```
