# Security

> Governs a server's secrets and the paths its process may write.

## Secrets

### server-secret-never-read-from-environment-variables → secret-never-passed-as-a-process-argument · MUST

Every secret a server reads reaches it from its host by a way other than its environment variables. Such ways include a file its host mounts in memory and a secret store the server reads itself. Exempt: a secret whose host offers no other way.

#### Why

Environment variables are copied into every child process, written into crash reports and diagnostic dumps and shown by the tools that inspect its host, while a file mounted in memory reaches only the code that opens it.

#### Examples

```ts title="Avoid"
// src/root/secrets.ts
export const readPaymentsApiKey = (env: Env): string =>
  env.PAYMENTS_API_KEY;   // copied into every child process and crash report
```

```ts title="Prefer"
// src/root/secrets.ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const readPaymentsApiKey = async (secretsDirectory: string): Promise<string> =>
  (await readFile(join(secretsDirectory, "payments-api-key"), "utf8")).trim();
```

## Access

### server-process-writes-only-its-declared-paths → process-runs-with-only-the-rights-its-job-needs · MUST

Every server's process can write only to the paths it declares to its host, never to its own code. Such paths include a mounted volume and a temporary folder.

#### Why

A flaw that lets an attacker run code in a process that can rewrite its own code keeps what the attacker leaves in it for every later start — least privilege.

#### Examples

```yaml title="Avoid"
# deploy/orders.yaml
containers:
  - name: orders
    image: registry.shop.example/orders:2026.11.3
    securityContext:
      runAsNonRoot: true   # can still rewrite its own code
```

```yaml title="Prefer"
# deploy/orders.yaml
containers:
  - name: orders
    image: registry.shop.example/orders:2026.11.3
    securityContext:
      runAsNonRoot: true
      readOnlyRootFilesystem: true
    volumeMounts:
      - name: tmp
        mountPath: /tmp
volumes:
  - name: tmp
    emptyDir:
      medium: Memory
```
