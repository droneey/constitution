# Docker

## docker-files-linted-in-the-check · MUST
The check lints every Dockerfile and every Compose file of the repository, and any finding fails it.

| Why | Check | Tags |
|---|---|---|
| a file the check skips is held by nothing, and a warning that passes is one nobody fixes. | tool/lint | [] |

## Images

## images-pinned-to-a-version · MUST
A base image in a Dockerfile, an image in a Compose file and an image a script runs name the most specific version the image is published under — `major.minor.patch` where it has one — never `latest`, never a floating major or minor, never none.

| Why | Check | Tags |
|---|---|---|
| a floating tag changes under the same name, so two builds of one commit run different code. | review | [security] |

## image-never-untagged-or-latest → images-pinned-to-a-version
No image in a Dockerfile or a Compose file is untagged or tagged `latest`.

| Why | Check | Tags |
|---|---|---|
| these are the floating forms the linters see; a floating major or minor is left to review. | tool/lint | [] |

## files-copied-never-added · MUST
Local files and folders enter an image with `COPY`, never `ADD`.

| Why | Check | Tags |
|---|---|---|
| `COPY` does one visible thing; `ADD` also fetches addresses and unpacks archives, unseen. | tool/lint | [security] |

## downloads-verified-archives-unpacked · MUST
A file from the network is downloaded in a `RUN` step at a pinned version and checked against its checksum, and an archive is unpacked with `tar`; `ADD` never fetches an address or unpacks an archive.

| Why | Check | Tags |
|---|---|---|
| an unverified download runs whatever the address serves that day, inside the image. | review | [security] |

## commands-in-exec-form · MUST
`CMD` and `ENTRYPOINT` use the JSON exec form, `["node", "main.js"]`.

| Why | Check | Tags |
|---|---|---|
| in the shell form a shell is the first process and swallows the stop signal, so every stop waits for the kill timeout. | tool/lint | [errors] |

## shell-steps-fail-on-any-error · MUST
A `RUN` that pipes sets `-o pipefail` through `SHELL`, and every `RUN` script passes a shell linter.

| Why | Check | Tags |
|---|---|---|
| without it a failing command before a pipe leaves a broken layer that the build reports as built. | tool/lint | [errors] |

## system-packages-pinned-and-lean · MUST
A system package is installed at a pinned version, without recommended extras, and the package index is removed in the same layer.

| Why | Check | Tags |
|---|---|---|
| an unpinned package changes between two builds of one commit, and every extra package and cached index is size and code to attack that the program never uses. | tool/lint | [security, performance] |

## image-runs-as-non-root · MUST
The final stage of an image sets `USER` to the numeric id of an unprivileged user.

| Why | Check | Tags |
|---|---|---|
| a process that runs as root inside a container turns any flaw of the program into control of the container, and a misconfigured one into control of the host; only a numeric id can be verified as not root before the process starts. | review | [security] |

## secrets-never-baked-into-images → secret-never-in-url-or-artefact
A build takes a secret through a secret mount, `RUN --mount=type=secret`, never through `ARG`, `ENV` or a copied file.

| Why | Check | Tags |
|---|---|---|
| a build argument, a variable and a copied file stay in the image's layers and history, readable by whoever pulls it. | review | [] |

## build-context-trimmed · SHOULD
`.dockerignore` leaves out version control, dependencies, local environment files and build output.

| Why | Check | Tags |
|---|---|---|
| the context is sent whole to the builder; a local environment file in it can end up in a layer, and every needless file slows each build. | review | [security, performance] |

## Compose

## compose-keys-in-shared-order · MUST
A Compose file lists its top-level keys as `name`, `include`, extensions (`x-*`), `services`, `networks`, `volumes`, and a service's keys as `image` or `build`, `container_name`, `extends`, `profiles`, `restart`, `command`, `depends_on`, `networks`, `ports`, `volumes`, `logging`, `healthcheck`, `security_opt`, `cap_drop`, `cap_add`, `read_only`, `labels`, `tmpfs`, `environment`.

| Why | Check | Tags |
|---|---|---|
| a service read in one order everywhere is compared at a glance, and a diff shows a moved key as a move. | tool/lint | [] |

## compose-without-version-field · MUST
A Compose file has no `version` field.

| Why | Check | Tags |
|---|---|---|
| Compose ignores it and warns; it only suggests a schema version that no longer exists. | tool/lint | [] |

## published-addresses-quoted-and-bound · MUST
Every mapping under `ports` is quoted and names the host interface it listens on: `'127.0.0.1:5432:5432'`.

| Why | Check | Tags |
|---|---|---|
| YAML can read an unquoted `22:22` as a number, and a mapping without an interface listens on every interface of the host, reachable from its network. | tool/lint | [security] |

## services-drop-privileges · SHOULD
A service's `security_opt` includes `no-new-privileges:true`, it sets `cap_drop: [ALL]`, adds back with `cap_add` only the capabilities it needs, and runs on a read-only file system, `read_only: true`, writing only to its volumes and `tmpfs`.

| Why | Check | Tags |
|---|---|---|
| a process broken into inside the container then cannot gain rights, reach the kernel's privileged calls or rewrite its own code. | review | [security] |

## repeated-settings-in-extension-fields · SHOULD
Settings several services share — environment, logging, health checks, security options — are written once, as an `x-*` extension with an anchor.

| Why | Check | Tags |
|---|---|---|
| a setting written once changes once; its copies drift apart one service at a time. | review | [] |

## variants-extend-a-disabled-base · SHOULD
The variants of one service extend a base service whose name starts with `_` and whose `profiles` is `[do-not-use]`; each variant is named with its environment's suffix, `-development`, `-test` or `-production`.

| Why | Check | Tags |
|---|---|---|
| the variants share one definition, the base never starts by itself, and a service's name says where it runs. | review | [] |

## dependencies-wait-until-healthy · SHOULD
A service that depends on another waits for `condition: service_healthy`, and the other declares a `healthcheck`.

| Why | Check | Tags |
|---|---|---|
| a started container is not a ready one; a service that starts before its database is ready fails its first requests. | review | [errors] |

## test-services-never-restart · SHOULD
A service that runs tests or a job in CI sets `restart: 'no'`.

| Why | Check | Tags |
|---|---|---|
| a failing test service that restarts hides its failure and keeps the run from ending. | review | [testing] |
