# Security

> Governs the secrets a run masks and the way a secret reaches it.

## Secrets

### secret-masked-in-the-output-of-started-programs → secret-kept-out-of-output · MUST

Every secret a run knows is masked in the output of every program it starts, before the run prints that output.

| Why |
|---|
| terminal output lands in automation's logs and on shared screens, and a program the run starts prints what it was given, so a secret it echoes is leaked to everyone who reads them. |

### run-secret-never-read-from-environment-variables → secret-never-passed-as-a-process-argument · MUST

No secret a run takes reaches it by environment variables. It reaches the run by a file only its user can read, by standard input or from the protected store. Exempt: a secret whose caller can use none of those ways.

| Why |
|---|
| environment variables reach every process the run starts and the crash reports it writes, where a file, standard input or the protected store reaches only the code that reads it. |
