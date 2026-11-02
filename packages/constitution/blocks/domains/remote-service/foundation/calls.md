# Calls

> Governs a call to another system: the addresses callers give it, its failures, its time, its load and the keys it pins.

## Addresses from callers

### address-from-a-caller-reached-only-if-public → outside-address-followed-only-from-an-allowlist · MUST

An address a caller gives the program to reach is reached only if it is public. Such an address — a callback to notify, a file to fetch, a link to preview — is reached only on a host of an allowlist where the program can know its hosts, with no redirect followed past these checks, and only when the address the host resolves to, checked as the connection opens, is public — not private, loopback, link-local, unspecified, shared, reserved, or an IPv4 address mapped into IPv6.

| Why |
|---|
| the program reaches what its callers cannot (its own network, the cloud's metadata endpoint) and an address checked before the connection is re-resolved in between by the attacker's name server. |

## Load

### concurrent-calls-to-a-system-bounded · SHOULD

Calls in flight to one remote system are bounded by a limit, and a call beyond it waits in a bounded queue or fails at once.

| Why |
|---|
| a slow system otherwise holds every connection and worker of the program, and the parts that never call it stop too — the bulkhead pattern. |

### calls-to-a-failing-system-cut-off-by-a-breaker · SHOULD

Calls to a remote system that keeps failing are cut off by a breaker. Past a threshold of failures the project sets, calls fail at once without reaching the system, and after a pause one trial call decides whether they resume.

| Why |
|---|
| calls to a system that is down only wait out their timeouts, hold the program's resources and slow the system's recovery — the circuit breaker pattern. |

## Security

### pinned-endpoint-carries-a-backup-pin · MUST

An endpoint whose key a client pins is pinned to at least two keys, one of them a backup not yet in use.

| Why |
|---|
| a pinned key that must be replaced otherwise cuts every client that pinned it off the system until that client is updated, and an installed app waits for its user to update it. |

## Requirements for implementation

### transport-sets-a-timeout-and-cancels · MUST

The transport sets a timeout on each call, per call, and cancels a call by its caller's signal.

| Why |
|---|
| a transport that cannot take a timeout and a signal per call leaves every call it makes unbounded and beyond its caller's cancel. |

### transport-tells-failures-apart · MUST

The transport tells its failures apart by type. A failure the remote system answered, a lost connection and a timeout each have a type of their own.

| Why |
|---|
| the three map to different errors of the program, each with its own next step, so a transport that confuses them sends its user to retry what was refused or to fix what only timed out. |
