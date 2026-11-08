# Services

> Governs a Compose file: its structure, its services' images and privileges, and how they start.

## Structure

### compose-keys-in-shared-order · MUST

Every Compose file's top-level keys, and each service's keys, follow one order shared by every file. The top-level keys run from the file's `name`, `include` and `x-*` extension fields to its `services`, then the `networks`, `volumes`, `secrets`, `configs` and `models` they use; a service's keys run from what it runs (its `image` or `build`, `container_name`, `extends`, `profiles` and `restart`) through how it starts and connects (`command`, `depends_on`, `networks`, `ports` and `volumes`) to its `logging`, `healthcheck`, its privileges (`security_opt`, `cap_drop`, `cap_add`, `read_only`), `labels`, `tmpfs` and `environment`. Exempt: a service key the list does not name, which stands where its file puts it.

| Why |
|---|
| keys in each file's own order make two services hard to compare, and a diff shows a moved key as one removed and one added. |

### compose-without-version-field → deprecated-form-never-used · MUST

No Compose file has a `version` field.

| Why |
|---|
| Compose ignores the field and warns on every run, and a reader takes it for a schema version that no longer exists. |

### repeated-settings-in-extension-fields → fact-has-one-source · MUST

Every setting several services share is written once, as an `x-*` extension field each of them takes in through its anchor. Such settings include the environment, logging, health checks and security options. The merge key `<<` that takes one in is the one Compose's reader defines, which `merge-key-never-used` allows.

| Why |
|---|
| copies of a setting drift apart one service at a time, as each is changed alone, so services meant to share it run with different values — a single source of truth. |

## Images

### service-image-pinned-to-its-full-version → download-pinned-to-its-version · MUST

Every service's `image` names its full version, `major.minor.patch` where the image has one, never `latest` or a floating major or minor.

| Why |
|---|
| a service whose image a moving tag names runs whatever the tag points at when its host pulls it, so two hosts of one deployment run different code. |

### service-image-checked-against-its-digest → download-checked-against-its-digest · MUST

Every service's `image` names its digest beside its version, as `<image>:x.y.z@sha256:<digest>`.

| Why |
|---|
| a tag can be moved to another image by whoever controls the registry, and only the digest makes the host refuse an image other than the one reviewed. |

## Security

### published-address-bound-to-its-interface · MUST

Every mapping under `ports` names the host's network interface it listens on.

| Why |
|---|
| a mapping without a network interface listens on every network interface of the host, reachable from its network. |

### service-forbids-privilege-gain → process-runs-with-only-the-rights-its-job-needs · MUST

Every service's `security_opt` includes `no-new-privileges:true`.

| Why |
|---|
| a process broken into inside a container can otherwise gain rights through a program that raises them, such as one with the set-user-ID bit — least privilege. |

### service-capabilities-dropped → process-runs-with-only-the-rights-its-job-needs · MUST

Every service sets `cap_drop: [ALL]` and adds back with `cap_add` only the capabilities it needs.

| Why |
|---|
| a container keeps by default capabilities its job never uses, and a process broken into inside it reaches the kernel's privileged calls through them — least privilege. |

### service-filesystem-read-only → process-runs-with-only-the-rights-its-job-needs · MUST

Every service runs on a read-only file system, `read_only: true`, writing only to its volumes and its `tmpfs`.

| Why |
|---|
| a process broken into inside a container whose file system it can write rewrites its own code and leaves its tools behind for the next run — least privilege. |

## Running

### dependencies-wait-until-ready · SHOULD

Every service that depends on another waits until it is ready: `condition: service_healthy` on a service that declares a `healthcheck`, `condition: service_completed_successfully` on a one-off job.

| Why |
|---|
| Compose starts a service once the containers it depends on have started, not once they are ready or, for a one-off job, done, so a local or test run sends its first steps to a service still starting and fails for no fault of the code. |

### test-services-never-restart → flaky-test-fixed-never-retried · SHOULD

Every service that runs tests or a one-off job in CI sets `restart: 'no'`.

| Why |
|---|
| a failing test service that restarts hides its failure and keeps the run from ending. |
