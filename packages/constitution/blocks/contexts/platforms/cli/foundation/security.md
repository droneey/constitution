# Security

> Governs secrets in output and in flags.

## Secrets

### output-masks-every-known-secret → secret-kept-out-of-output · MUST

Every secret the run knows is masked in its output. It is masked before it is printed, in all output, that of the tools the run starts included.

| Why |
|---|
| terminal output lands in CI logs and on shared screens, where a printed secret is leaked to everyone who reads them. |

### secret-never-passed-as-a-flag → secret-never-passed-as-a-process-argument · MUST

A secret never reaches a command as a flag's value. It reaches it through a file only its user can read, standard input, the system's credential store, or an environment built for it where its caller offers no other way.

| Why |
|---|
| a flag's value is visible to every user of the machine in the process list and is kept in the shell's history. |
