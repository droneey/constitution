# Captured responses

> Governs the captured responses that stand in for another system in a spec.

## General

### remote-system-proven-by-captured-responses · SHOULD

A remote system a spec cannot run in its sandbox is proven through the transport, with responses captured from it.

| Why |
|---|
| the remote system's engine runs only on its side, so its answers, captured once, are the closest a spec can come to it. |

### captured-response-verified-against-its-system · SHOULD

A captured response is verified against the system that gave it: captured again, with any difference reported; a system of the same repository is checked against its own contract instead.

| Why |
|---|
| a remote system changes its answers without telling anyone, and a spec on an old capture keeps passing while the program breaks. |

### unmatched-request-fails-the-spec → test-runs-in-a-sandbox · MUST

A transport replaced by captured responses fails on a request none of them matches, naming its method and address.

| Why |
|---|
| a request nobody captured otherwise gets an empty answer, and the spec passes on code that would fail against the real system. |
