# Compose

> Governs a Compose file and its services.

## Structure

### compose-keys-in-shared-order · MUST

A Compose file lists its top-level keys as `name`, `include`, extensions (`x-*`), `services`, `networks`, `volumes`, and a service's keys as `image` or `build`, `container_name`, `extends`, `profiles`, `restart`, `command`, `depends_on`, `networks`, `ports`, `volumes`, `logging`, `healthcheck`, `security_opt`, `cap_drop`, `cap_add`, `read_only`, `labels`, `tmpfs`, `environment`.

| Why | Tags |
|---|---|
| a service read in one order everywhere is compared at a glance, and a diff shows a moved key as a move. | [] |

### compose-without-version-field · MUST

A Compose file has no `version` field.

| Why | Tags |
|---|---|
| Compose ignores it and warns; it only suggests a schema version that no longer exists. | [] |

### repeated-settings-in-extension-fields · SHOULD

Settings several services share — environment, logging, health checks, security options — are written once, as an `x-*` extension with an anchor.

| Why | Tags |
|---|---|
| a setting written once changes once; its copies drift apart one service at a time. | [] |

### variants-extend-a-disabled-base · SHOULD

The variants of one service extend a base service whose name starts with `_` and whose `profiles` is `[do-not-use]`; each variant is named with its environment's suffix, `-development`, `-test` or `-production`.

| Why | Tags |
|---|---|
| the variants share one definition, the base never starts by itself, and a service's name says where it runs. | [] |

## Security

### published-addresses-quoted-and-bound · MUST

Every mapping under `ports` is quoted and names the host interface it listens on: `'127.0.0.1:5432:5432'`.

| Why | Tags |
|---|---|
| YAML can read an unquoted `22:22` as a number, and a mapping without an interface listens on every interface of the host, reachable from its network. | [security] |

### services-drop-privileges · SHOULD

A service's `security_opt` includes `no-new-privileges:true`, it sets `cap_drop: [ALL]`, adds back with `cap_add` only the capabilities it needs, and runs on a read-only file system, `read_only: true`, writing only to its volumes and `tmpfs`.

| Why | Tags |
|---|---|
| a process broken into inside the container then cannot gain rights, reach the kernel's privileged calls or rewrite its own code. | [security] |

## Running

### dependencies-wait-until-healthy · SHOULD

A service that depends on another waits for `condition: service_healthy`, and the other declares a `healthcheck`.

| Why | Tags |
|---|---|
| a started container is not a ready one; a service that starts before its database is ready fails its first requests. | [errors] |

### test-services-never-restart · SHOULD

A service that runs tests or a job in CI sets `restart: 'no'`.

| Why | Tags |
|---|---|
| a failing test service that restarts hides its failure and keeps the run from ending. | [testing] |
