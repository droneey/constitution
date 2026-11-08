# Security

> Governs child processes, outside paths and the comparison of secrets under a JavaScript runtime.

## Secrets

### spawn-given-an-env-built-for-it → child-process-variables-built-for-it · MUST

Every child process is passed an `env` built for it. This holds for a process the program starts through `spawn`, `execFile` or the runtime's own forms of them, which is never left to inherit `process.env` and never given a copy of it. Exempt: a script that only runs other programs, which passes on what its caller built for them, each secret it received only to the program that reads it.

| Why |
|---|
| each of these calls copies the whole of `process.env` into the child when `env` is left out, a secret among it — least privilege. |

## Input from outside

### child-process-started-without-a-shell · MUST

No process is started through a shell. Its arguments go as an array, through `execFile`, `spawn` and the runtime's own forms of them, never through `exec`, `execSync` or the option `shell: true`.

| Why |
|---|
| a command line handed to a shell is parsed again, and a `;` or a `$(…)` in its input runs as a command of its own. |

### outside-path-checked-by-relative → outside-path-confined-to-its-root · MUST

Every path built from outside input is confined by `path.relative` between real paths. It is resolved with `path.resolve(root, input)`, taken to its real path by `fs.realpath` — of its folder, for a file not yet made — and refused when `path.relative` from the root's real path is `..`, starts with `..` and a separator, or is absolute; where another writer can change the tree, the file is opened and its handle's `stat()` device and inode are compared with those of the checked real path.

| Why |
|---|
| `path.join` follows every `..` it is given, out of the root, and a check on the string before it is resolved misses an encoded or nested one. |

## Primitives

### secret-compared-by-timing-safe-equal → secret-compared-in-constant-time · MUST

Every secret is compared by `timingSafeEqual`. A token, a signature or a key is compared with `timingSafeEqual` from `node:crypto`, or the runtime's equivalent, over the HMACs or digests of both sides, never with `===`.

| Why |
|---|
| `===` stops at the first byte that differs, and the time it takes tells an attacker how much of a guess was right. |
