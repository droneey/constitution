# Tests

> Governs the specs that stand in for another system.

## Captured responses

### remote-system-proven-by-captured-responses · SHOULD
A remote system a spec cannot run in its sandbox is proven through the transport, with responses captured from it.

| Why | Tags |
|---|---|
| the remote system's engine runs only on its side, so its answers, captured once, are the closest a spec can come to it. | [testing] |

### captured-response-verified-against-its-system · SHOULD
A captured response is verified against the system that gave it: captured again, with any difference reported; a system of the same repository is checked against its own contract instead.

| Why | Tags |
|---|---|
| a remote system changes its answers without telling anyone, and a spec on an old capture keeps passing while the program breaks. | [testing] |

### unmatched-request-fails-the-spec → test-runs-in-a-sandbox · MUST
A transport replaced by captured responses fails on a request none of them matches, naming its method and address.

| Why | Tags |
|---|---|
| a request nobody captured otherwise gets an empty answer, and the spec passes on code that would fail against the real system. | [testing] |

## Failures

### call-timeout-and-lost-connection-have-cases → declared-failure-has-a-case · SHOULD
A call to a remote system has a case for its timeout and one for its lost connection.

| Why | Tags |
|---|---|
| these failures are rare on a developer's machine and common in the field, so only a case exercises them before a user does. | [testing] |
