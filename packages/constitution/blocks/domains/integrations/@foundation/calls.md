# Calls

> Governs a call to another system: its load and its failures.

## Vocabulary

A **remote system** is another system, not run by the program, that the program reaches over a network or that calls back over a network an address the program gave it, as a sender of webhooks does. A store the program owns and a broker are none, though the program reaches them over a network too.

A remote system's **remote transport** is the library, and its configured instance, through which the program's calls reach that system over its protocol.

A remote system's **unauthenticated failure** is its refusal of a call whose caller it knows by no valid credential, as for an expired session; its **forbidden failure** is its refusal of a call whose caller it knows but whose rights do not reach what the call asks.

## Load

### concurrent-calls-to-a-system-bounded · SHOULD

Every remote system has a bound on the calls in flight to it; a call beyond it waits in a bounded queue or fails at once.

| Why |
|---|
| a slow system otherwise holds every connection and worker of the program, and the parts that never call it stop too — the bulkhead pattern. |

### calls-to-a-failing-system-cut-back · SHOULD

Every remote system that keeps failing has the program's calls cut back by a circuit breaker or an adaptive retry limit. A circuit breaker, past a threshold of failures the project sets, fails calls at once without reaching the system, and after a pause lets one trial call decide whether they resume. An adaptive retry limit lets a failed call be retried only while retries stay within a share of the calls that succeed, a share the project sets.

| Why |
|---|
| calls to a system that is down only wait out their timeouts, hold the program's resources and slow the system's recovery, while a breaker each client keeps trips on its own small view of the system and can deepen an outage of part of it, which a retry limit does not — the circuit breaker pattern; Brooker, "Retries" (2022). |

## Failures

### remote-failure-mapped-by-its-kind → dependency-failure-mapped-where-it-is-wrapped · MUST

Every failure of a call to a remote system is mapped by its kind. A failure the remote system answered, a lost connection and a timeout each maps to an error of the program's own.

| Why |
|---|
| the three map to different errors of the program, each with its own next step, so a program that maps them alike sends its user to retry what was refused or to fix what only timed out. |
