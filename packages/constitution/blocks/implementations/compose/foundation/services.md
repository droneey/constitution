# Services

> Governs a Compose file: its structure, its services' images and privileges, and how they start.

## Structure

### compose-keys-in-shared-order · MUST

A Compose file's top-level keys, and a service's keys, follow the one order the presets set.

| Why |
|---|
| keys in each file's own order make two services hard to compare, and a diff shows a moved key as one removed and one added. |

### compose-without-version-field → deprecated-form-never-used · MUST

A Compose file has no `version` field.

| Why |
|---|
| Compose ignores the field and warns on every run, and a reader takes it for a schema version that no longer exists. |

### repeated-settings-in-extension-fields · SHOULD

Settings several services share are written once, as an `x-*` extension with an anchor. Such settings include the environment, logging, health checks and security options.

| Why |
|---|
| copies of a setting drift apart one service at a time, as each is changed alone; Compose's reader defines the merge key `<<` that takes the extension into a service — a single source of truth. |

## Images

### service-image-pinned-by-version-and-digest → download-pinned-by-version-and-checksum · MUST

A service's `image` is written `image:x.y.z@sha256:<digest>`. The version is `major.minor.patch` where the image has one, never `latest` or a floating major or minor.

| Why |
|---|
| a service whose image a tag names runs whatever the tag points at when its host pulls it, so two hosts of one deployment run different code. |

## Security

### published-address-bound-to-its-interface · MUST

Every mapping under `ports` names the host's network interface it listens on.

| Why |
|---|
| a mapping without a network interface listens on every network interface of the host, reachable from its network. |

### services-drop-privileges → process-runs-with-only-the-rights-its-job-needs · MUST

A service drops every privilege it does not need. Its `security_opt` includes `no-new-privileges:true`, it sets `cap_drop: [ALL]` and adds back with `cap_add` only the capabilities it needs, and it runs on a read-only file system, `read_only: true`, writing only to its volumes and `tmpfs`.

| Why |
|---|
| a process broken into inside a container that keeps its privileges can gain rights, reach the kernel's privileged calls and rewrite its own code — least privilege. |

## Running

### dependencies-wait-until-healthy · SHOULD

A service that depends on another waits for `condition: service_healthy`, and the other declares a `healthcheck`.

| Why |
|---|
| a started container is not a ready one; a service that starts before its database is ready fails its first requests. |

### test-services-never-restart → flaky-test-fixed-never-retried · SHOULD

A service that runs tests or a job in CI sets `restart: 'no'`.

| Why |
|---|
| a failing test service that restarts hides its failure and keeps the run from ending. |
