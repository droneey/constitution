# Calls

> Governs a call to another system: its failures, its time and its load.

## Addresses from callers

### address-from-a-caller-reached-only-if-public → outside-address-followed-only-from-an-allowlist · MUST
An address a caller gives for the program to reach — a webhook, a file to fetch, a link to preview — is reached only on a host of an allowlist where the program can know its hosts, with no redirect followed past these checks, and only when the address the host resolves to, checked as the connection opens, is not private, loopback or link-local.

| Why | Tags |
|---|---|
| the program reaches what its callers cannot — its own network, the cloud's metadata endpoint — and an address checked before the connection is re-resolved in between by the attacker's name server. | [security] |

## Failures

### call-cut-by-the-network-is-an-expected-failure → failure-is-expected-or-defect · MUST
A call to a remote system that times out, loses its connection or cannot reach the system fails with an expected failure of its own type, which its caller handles and may retry — never a hang, a defect or a silent loss.

| Why | Tags |
|---|---|
| a remote system is out of reach somewhere every day, and a program that treats that as a bug fails its users each time. | [errors] |

## Time

### call-takes-the-remaining-deadline · SHOULD
A call made for a unit of work that has a deadline — a request, a task — takes the time that unit has left, never a full timeout of its own, and is not made once none is left.

| Why | Tags |
|---|---|
| a nested call with a full timeout of its own keeps working after its caller has given up, and its answer reaches nobody. | [performance] |

### retry-honours-retry-after → failure-retried-only-when-transient · SHOULD
A retry of a call the remote system refused as rate-limited or unavailable waits at least as long as its `Retry-After` asks, and gives up when that wait passes the caller's deadline.

| Why | Tags |
|---|---|
| a retry sooner than the remote system asked is refused again and deepens the overload it was told about. | [errors, performance] |

## Load

### concurrent-calls-to-a-system-bounded · SHOULD
Calls in flight to one remote system are bounded by a limit, and a call beyond it waits in a bounded queue or fails at once.

| Why | Tags |
|---|---|
| a slow system otherwise holds every connection and worker of the program, and the parts that never call it stop too. | [performance] |

### calls-to-a-failing-system-cut-off-by-a-breaker · SHOULD
Calls to a remote system that keeps failing are cut off by a breaker: past a threshold of failures the project sets, calls fail at once without reaching the system, and after a pause one trial call decides whether they resume.

| Why | Tags |
|---|---|
| calls to a system that is down only wait out their timeouts, hold the program's resources and slow the system's recovery. | [errors, performance] |

## Security

### call-verifies-the-systems-certificate · MUST
A call to another system over TLS verifies the system's certificate and its name, and never turns the verification off.

| Why | Tags |
|---|---|
| a call that trusts any certificate talks to whoever sits on its path. | [security] |

## Requirements for implementation

### transport-sets-a-timeout-and-cancels · MUST
The transport sets a timeout on each call, per call, and cancels a call by its caller's signal.

| Why | Tags |
|---|---|
| without it, no call can be held to a timeout or cancelled by its caller. | [errors, performance] |

### transport-tells-failures-apart · MUST
The transport tells apart, each by a type of its own, a failure the remote system answered, a lost connection and a timeout.

| Why | Tags |
|---|---|
| each maps to a different error of the program, with a different next step for its user. | [errors] |
