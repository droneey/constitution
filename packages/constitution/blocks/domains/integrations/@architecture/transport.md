# Transport

> Governs where a remote transport is built and imported, how its failures reach the program, and what a port over its system declares of them.

## Vocabulary

A remote system's **access errors** are the two errors of the kernel that stand for its unauthenticated failure and its forbidden failure in the program's own words, among the failures every port over one kind of system declares.

## General

### one-transport-instance-per-system → composition-root-assembles-the-program · SHOULD

Every remote system has one configured instance of its remote transport, handed to every adapter that reaches that system. The instance holds the system's base address, headers and credentials.

| Why |
|---|
| an adapter that builds its own instance speaks to the system its own way, with its own address and credentials, and a spec must replace each instance apart. |

## Homes

### transport-library-home-is-its-systems-client → layer-imports-dependencies-by-its-role · MUST

The remote transport library is imported only by the client of its system, the mapper of its failures and `root/`. `root/` builds the instances, and the client of a system is the module that speaks its remote transport: an adapter of that system, or a client under `libs/` that knows nothing of the program and that its adapters share.

| Why |
|---|
| the network is an effect, so each other import of the library is one more place a spec cannot replace with a fake, and one more place its failures escape the one mapper every adapter shares. |

## Failures

### transport-failures-mapped-once → shared-piece-placed-by-meaning · SHOULD

Every remote transport's failures are mapped by one mapper all its adapters share. It maps them into the failures of the ports they implement, a transient one included.

| Why |
|---|
| a mapping repeated in each adapter drifts, so one system's failure reaches different features as different errors, and each feature restates what they all share. |

### transport-mapper-takes-each-features-codes · SHOULD

The remote transport's mapper takes each feature's codes from that feature's own map, never naming them itself.

| Why |
|---|
| a mapper that named each feature's codes itself would know every feature and change with each of them. |

### transport-mapper-maps-access-failures-to-the-kernels · MUST

The remote transport's mapper itself maps its system's unauthenticated failure and forbidden failure to its access errors.

| Why |
|---|
| an access failure mapped by each feature its own way cannot be recognised in one place, so the program ends a session for one feature's refusal and misses another's expiry. |

### port-over-a-system-declares-its-access-failures · MUST

Every port over a remote system declares that system's access errors among its failures.

| Why |
|---|
| a port that leaves them out hides from its use case a failure any call through it may meet, so the use case meets an ended session or a refused right as a defect. |
