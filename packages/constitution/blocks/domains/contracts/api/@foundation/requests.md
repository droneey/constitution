# Requests

> Governs how a request is followed, cancelled and kept apart from long work.

## Vocabulary

A **call handle** is a value that names one operation or task, which its caller follows or cancels after the request that started it.

## Handles

### call-handle-unguessable → guarding-token-from-a-cryptographic-random-source · MUST

Every call handle comes from a cryptographic random source.

| Why |
|---|
| a handle that can be guessed lets anyone follow, or act on, the work of the caller who got it. |

### call-handle-never-a-credential · MUST

No call handle ever authenticates its caller by itself.

| Why |
|---|
| a handle that stands in for a credential lets whoever holds it, from a log or a shared link, act as the caller who got it. |

### expired-handle-answered-as-expired → expected-failure-carries-a-stable-code · MUST

Every call handle that is expired or unknown is answered as an expected failure that says so.

| Why |
|---|
| a caller recovers from an expired handle only if the answer says it expired. |

## Cancellation

### abandoned-request-stops-its-work · SHOULD

Every request its caller cancels or abandons stops its work and the calls it made, and sends nothing more. A caller cancels or abandons it by a cancel message or a closed connection.

| Why |
|---|
| work for a caller who left spends capacity and the quota of the systems it calls. |

## Long work

### long-operation-answered-with-a-handle · SHOULD

Every operation that may outlast a request answers at once with a call handle, never holding the request open until it ends. Its caller follows the handle for the operation's state and its result. Exempt: a call whose protocol or caller can follow no handle.

| Why |
|---|
| a request held open for long work is cut by a proxy or a timeout, and its caller can neither learn the outcome nor retry safely. |
