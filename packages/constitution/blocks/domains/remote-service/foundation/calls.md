# Calls

> Governs a call to another system: the addresses callers give it, its failures, its time, its load and its TLS.

## Addresses from callers

### address-from-a-caller-reached-only-if-public → outside-address-followed-only-from-an-allowlist · MUST

An address a caller gives for the program to reach — a callback to notify, a file to fetch, a link to preview — is reached only on a host of an allowlist where the program can know its hosts, with no redirect followed past these checks, and only when the address the host resolves to, checked as the connection opens, is public — not private, loopback, link-local, unspecified, shared, reserved, or an IPv4 address mapped into IPv6.

| Why | Tags |
|---|---|
| the program reaches what its callers cannot — its own network, the cloud's metadata endpoint — and an address checked before the connection is re-resolved in between by the attacker's name server. | [security] |

## Failures

### call-cut-by-the-network-is-an-expected-failure → failure-is-expected-or-defect · MUST

A call to a remote system that times out, loses its connection or cannot reach the system fails with an expected failure of its own type, which its caller handles and may retry — never a hang, a defect or a silent loss.

| Why | Tags |
|---|---|
| a remote system is out of reach somewhere every day, and a program that treats that as a bug fails its users each time. | [errors] |

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

### call-runs-over-verified-tls · MUST

A call to another system that crosses a network runs over TLS — the program's own, or that of a proxy on its host that verifies for it — which verifies the system's certificate and its name, and never turns the verification off.

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
