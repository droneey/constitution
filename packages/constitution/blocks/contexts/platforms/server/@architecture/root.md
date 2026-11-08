# Root

> Governs how the composition root assembles a server's start and its stop.

## Assembly

### server-process-assembled-with-only-what-its-kind-needs → composition-root-assembles-the-program · MUST

The composition root assembles each kind of process a server runs with only the parts that kind uses. Such parts include its adapters, its pools and its listeners.

| Why |
|---|
| a process assembled with parts it never uses opens connections, takes memory and fails on dependencies its work never touches. |

### server-listeners-opened-last → composition-root-assembles-the-program · MUST

The composition root opens a server's listeners and consumers of messages last, only once every part they use is built.

| Why |
|---|
| work taken before the parts it uses are ready fails, though nothing is wrong with it. |

### server-stop-closes-its-listeners-first → stateful-resource-released-by-the-programs-stop · MUST

The stop path closes a server's listeners and consumers of messages first. It closes every other part after them, in the reverse of the order the composition root built them.

| Why |
|---|
| a part closed under work still running turns a clean stop into failures, and work still taken while the parts it uses close fails at once. |
