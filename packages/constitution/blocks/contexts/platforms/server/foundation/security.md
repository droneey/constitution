# Security

> Governs the server's secrets, its cloud access and its privileges.

## Secrets

### server-cloud-access-through-workload-identity → credential-short-lived · SHOULD

A server its host gives a workload identity reaches that cloud with it, never with a long-lived key. It reaches the systems of that cloud with the identity's short-lived credentials.

| Why |
|---|
| a long-lived key can be copied, leaked or forgotten, and works for whoever holds it until someone rotates it by hand. |

### server-process-runs-unprivileged → process-runs-with-only-the-rights-its-job-needs · MUST

A server's process runs unprivileged. It runs as a user without administrative rights, cannot write its own code, and writes only to the paths it declares.

| Why |
|---|
| one flaw that runs code in a privileged process owns its host, and a process that can rewrite its own code keeps what the attacker leaves in it — least privilege. |

### server-secret-read-from-the-host-not-the-environment · SHOULD

A server reads each secret from its host rather than its environment. It reads it from a file its host mounts in memory, such as a secret volume of Kubernetes, or fetches it with its host's workload identity; it takes a secret from its environment only where its host offers no other way.

| Why |
|---|
| the environment is copied into every child process, written into crash reports and diagnostic dumps and shown by the host's inspect commands, while a file mounted in memory reaches only the code that opens it. |
