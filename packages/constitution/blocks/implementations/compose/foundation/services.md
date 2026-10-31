# Services

> Governs a Compose file: its structure, its services' images and privileges, and how they start.

## Structure

### compose-keys-in-shared-order · MUST

A Compose file's top-level keys, and a service's keys, follow the one order the presets set.

| Why |
|---|
| a service read in one order everywhere is compared at a glance, and a diff shows a moved key as a move. |

### compose-without-version-field · MUST

A Compose file has no `version` field.

| Why |
|---|
| Compose ignores it and warns; it only suggests a schema version that no longer exists. |

### repeated-settings-in-extension-fields · SHOULD

Settings several services share — environment, logging, health checks, security options — are written once, as an `x-*` extension with an anchor.

| Why |
|---|
| a setting written once changes once; its copies drift apart one service at a time; Compose's reader defines the merge key `<<` that takes them into a service. |

## Images

### service-image-pinned-by-version-and-digest → download-pinned-by-version-and-checksum · MUST

A service's `image` names the most specific version the image is published under — `major.minor.patch` where it has one — and its digest, `image:x.y.z@sha256:<digest>`; never `latest`, never a floating major or minor, never a tag alone and never a digest alone.

| Why |
|---|
| any tag, a patch's included, can be pushed again under the same name, so only the digest fixes what a service runs; the version beside it tells a reader and an updater which release the digest is. |

## Security

### published-address-bound-to-its-interface · MUST

Every mapping under `ports` names the host interface it listens on: `'127.0.0.1:5432:5432'`.

| Why |
|---|
| a mapping without an interface listens on every interface of the host, reachable from its network. |

### services-drop-privileges · SHOULD

A service's `security_opt` includes `no-new-privileges:true`, it sets `cap_drop: [ALL]`, adds back with `cap_add` only the capabilities it needs, and runs on a read-only file system, `read_only: true`, writing only to its volumes and `tmpfs`.

| Why |
|---|
| a process broken into inside the container then cannot gain rights, reach the kernel's privileged calls or rewrite its own code. |

## Running

### dependencies-wait-until-healthy · SHOULD

A service that depends on another waits for `condition: service_healthy`, and the other declares a `healthcheck`.

| Why |
|---|
| a started container is not a ready one; a service that starts before its database is ready fails its first requests. |

### test-services-never-restart · SHOULD

A service that runs tests or a job in CI sets `restart: 'no'`.

| Why |
|---|
| a failing test service that restarts hides its failure and keeps the run from ending. |
