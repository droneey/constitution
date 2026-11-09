# Services

> Governs a Compose file: its structure, its services' images and privileges, and how they start.

## Structure

### compose-keys-in-shared-order · MUST

Every Compose file's top-level keys, and each service's keys, follow one order shared by every file. The top-level keys run from the file's `name`, `include` and `x-*` extension fields to its `services`, then the `networks`, `volumes`, `secrets`, `configs` and `models` they use; a service's keys run from what it runs (its `image` or `build`, `container_name`, `extends`, `profiles` and `restart`) through how it starts and connects (`command`, `depends_on`, `networks`, `ports` and `volumes`) to its `logging`, `healthcheck`, its privileges (`security_opt`, `cap_drop`, `cap_add`, `read_only`), `labels`, `tmpfs` and `environment`. Exempt: a service key the list does not name, which stands where its file puts it.

#### Why

Keys in each file's own order make two services hard to compare, and a diff shows a moved key as one removed and one added.

#### Examples

```yaml title="Avoid"
services:
  shop-api:
    environment:
      LOG_LEVEL: info
    read_only: true
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    cap_drop: [ALL]
    ports:
      - '127.0.0.1:8080:8080'
    security_opt: ['no-new-privileges:true']
```

```yaml title="Prefer"
services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    ports:
      - '127.0.0.1:8080:8080'
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
    environment:
      LOG_LEVEL: info
```

### compose-without-version-field → deprecated-form-never-used · MUST

No Compose file has a `version` field.

#### Why

Compose ignores the field and warns on every run, and a reader takes it for a schema version that no longer exists.

#### Examples

```yaml title="Avoid"
version: '3.8'
services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

```yaml title="Prefer"
name: shop
services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

### repeated-settings-in-extension-fields → fact-has-one-source · MUST

Every setting several services share is written once, as an `x-*` extension field each of them takes in through its anchor. Such settings include the environment, logging, health checks and security options. The merge key `<<` that takes one in is the one Compose's reader defines, which `merge-key-never-used` allows.

#### Why

Copies of a setting drift apart one service at a time, as each is changed alone, so services meant to share it run with different values — a single source of truth.

#### Examples

```yaml title="Avoid"
services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
  shop-worker:
    image: registry.shop.example/shop-worker:2.4.0@sha256:7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

```yaml title="Prefer"
x-hardened: &hardened
  security_opt: ['no-new-privileges:true']
  cap_drop: [ALL]
  read_only: true

services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    <<: *hardened
  shop-worker:
    image: registry.shop.example/shop-worker:2.4.0@sha256:7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c
    <<: *hardened
```

## Images

### service-image-pinned-to-its-full-version → download-pinned-to-its-version · MUST

Every service's `image` names its full version, `major.minor.patch` where the image has one, never `latest` or a floating major or minor.

#### Why

A service whose image a moving tag names runs whatever the tag points at when its host pulls it, so two hosts of one deployment run different code.

#### Examples

```yaml title="Avoid"
services:
  cache:
    image: valkey/valkey:8@sha256:0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

```yaml title="Prefer"
services:
  cache:
    image: valkey/valkey:8.0.2@sha256:0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

### service-image-checked-against-its-digest → download-checked-against-its-digest · MUST

Every service's `image` names its digest beside its version, as `<image>:x.y.z@sha256:<digest>`. Exempt: the `image` of a service whose `build` makes it and whose `pull_policy` is `build`, which names the image that build tags.

#### Why

A tag can be moved to another image by whoever controls the registry, and only the digest makes the host refuse an image other than the one reviewed.

#### Examples

```yaml title="Avoid"
services:
  cache:
    image: valkey/valkey:8.0.2
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

```yaml title="Prefer"
services:
  cache:
    image: valkey/valkey:8.0.2@sha256:0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

## Security

### published-address-bound-to-its-interface · MUST

Every mapping under `ports` names the host's network interface it listens on.

#### Why

A mapping without a network interface listens on every network interface of the host, reachable from its network.

#### Examples

```yaml title="Avoid"
services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    ports:
      - '8080:8080'
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

```yaml title="Prefer"
services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    ports:
      - '127.0.0.1:8080:8080'
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

### service-forbids-privilege-gain → process-runs-with-only-the-rights-its-job-needs · MUST

Every service's `security_opt` includes `no-new-privileges:true`.

#### Why

A process broken into inside a container can otherwise gain rights through a program that raises them, such as one with the set-user-ID bit — least privilege.

#### Examples

```yaml title="Avoid"
services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    cap_drop: [ALL]
    read_only: true
```

```yaml title="Prefer"
services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

### service-capabilities-dropped → process-runs-with-only-the-rights-its-job-needs · MUST

Every service sets `cap_drop: [ALL]` and adds back with `cap_add` only the capabilities it needs.

#### Why

A container keeps by default capabilities its job never uses, and a process broken into inside it reaches the kernel's privileged calls through them — least privilege.

#### Examples

```yaml title="Avoid"
services:
  shop-proxy:
    image: caddy:2.8.4@sha256:9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b
    security_opt: ['no-new-privileges:true']
    cap_add: [NET_BIND_SERVICE]
    read_only: true
```

```yaml title="Prefer"
services:
  shop-proxy:
    image: caddy:2.8.4@sha256:9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    cap_add: [NET_BIND_SERVICE]
    read_only: true
```

### service-filesystem-read-only → process-runs-with-only-the-rights-its-job-needs · MUST

Every service runs on a read-only file system, `read_only: true`, writing only to its volumes and its `tmpfs`.

#### Why

A process broken into inside a container whose file system it can write rewrites its own code and leaves its tools behind for the next run — least privilege.

#### Examples

```yaml title="Avoid"
services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    volumes:
      - uploads:/app/uploads
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
```

```yaml title="Prefer"
services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    volumes:
      - uploads:/app/uploads
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
    tmpfs:
      - /tmp
```

## Running

### dependencies-wait-until-ready · SHOULD

Every service that depends on another waits until it is ready: `condition: service_healthy` on a service that declares a `healthcheck`, `condition: service_completed_successfully` on a one-off job.

#### Why

Compose starts a service once the containers it depends on have started, not once they are ready or, for a one-off job, done, so a local or test run sends its first steps to a service still starting and fails for no fault of the code.

#### Examples

```yaml title="Avoid"
x-hardened: &hardened
  security_opt: ['no-new-privileges:true']
  cap_drop: [ALL]
  read_only: true

services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    depends_on:
      - orders-db
    <<: *hardened
  orders-db:
    image: postgres:17.2@sha256:3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f
    user: postgres
    volumes:
      - orders-data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD', 'pg_isready', '-U', 'orders']
    <<: *hardened
    tmpfs:
      - /tmp
      - /var/run/postgresql
    environment:
      POSTGRES_USER: orders
      POSTGRES_PASSWORD_FILE: /run/secrets/orders-db-password
    secrets: [orders-db-password]

volumes:
  orders-data:

secrets:
  orders-db-password:
    file: ./secrets/orders-db-password
```

```yaml title="Prefer"
x-hardened: &hardened
  security_opt: ['no-new-privileges:true']
  cap_drop: [ALL]
  read_only: true

services:
  shop-api:
    image: registry.shop.example/shop-api:2.4.0@sha256:6f2b8a1d4c3e5f7091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708
    depends_on:
      orders-db:
        condition: service_healthy
    <<: *hardened
  orders-db:
    image: postgres:17.2@sha256:3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f
    user: postgres
    volumes:
      - orders-data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD', 'pg_isready', '-U', 'orders']
      interval: 2s
      retries: 15
    <<: *hardened
    tmpfs:
      - /tmp
      - /var/run/postgresql
    environment:
      POSTGRES_USER: orders
      POSTGRES_PASSWORD_FILE: /run/secrets/orders-db-password
    secrets: [orders-db-password]

volumes:
  orders-data:

secrets:
  orders-db-password:
    file: ./secrets/orders-db-password
```

### test-services-never-restart → flaky-test-fixed-never-retried · SHOULD

Every service that runs tests or a one-off job in CI sets `restart: 'no'`.

#### Why

A failing test service that restarts hides its failure and keeps the run from ending.

#### Examples

```yaml title="Avoid"
services:
  integration-specs:
    image: registry.shop.example/shop-api-specs:2.4.0@sha256:7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c
    restart: on-failure
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```

```yaml title="Prefer"
services:
  integration-specs:
    image: registry.shop.example/shop-api-specs:2.4.0@sha256:7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c
    restart: 'no'
    security_opt: ['no-new-privileges:true']
    cap_drop: [ALL]
    read_only: true
```
