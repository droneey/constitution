# Failures

> Governs how a failure is answered.

## Answers

### failure-answered-by-its-code → expected-failure-is-part-of-the-contract · MUST
A failure of a request is answered from what failed: an expected error with the answer its code maps to, carrying its code and details; a refusal the framework raises before the operation runs — a refused input, an unknown route, method or tool — as the caller's failure of that kind, a refused input naming the path of each field it refused; and any other failure as an internal error.

| Why | Tags |
|---|---|
| a caller branches on a code that stays when a message is reworded, and a refusal answered in the framework's own shape is one more shape every client must parse. | [errors] |

### unexpected-failure-answered-masked → failure-shown-as-what-happened-and-what-next · MUST
A failure that is neither an expected error nor a refusal of the caller's input is answered masked: no message, class, trace or cause of it reaches the caller.

| Why | Tags |
|---|---|
| an unexpected failure's message and trace tell an attacker how the program works and which of its parts broke. | [errors, security] |

### failure-answer-names-its-occurrence · SHOULD
Every failure answer, a masked one included, carries an identifier of its occurrence — the trace id, or the problem document's `instance` — that finds its record in the program's logs.

| Why | Tags |
|---|---|
| a masked answer otherwise leaves a caller nothing to quote to support, and support nothing to search for. | [errors] |

## Raising

### error-carries-a-code-never-a-status → expected-failure-is-part-of-the-contract · MUST
An error the code of a request raises carries a code, never a status or an answer of the protocol — neither the framework's error nor one of the program's own that holds a status.

| Why | Tags |
|---|---|
| a status chosen where the error is raised ties that code to one protocol, and the answer is then decided in two places that drift apart. | [errors] |

## Requirements for implementation

### framework-passes-every-failure-to-one-handler · MUST
The server framework passes every failure of a request — a route's or a tool's, a refused input, an unknown route, method or tool — to one handler the program registers, and answers none of them in a shape of its own.

| Why | Tags |
|---|---|
| without it, some failures leave in the framework's shape, unmasked, and the one handler cannot be written. | [errors] |
