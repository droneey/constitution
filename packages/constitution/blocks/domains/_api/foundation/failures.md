# Failures

> Governs how a failure is answered and how it is raised.

## Answers

### failure-answered-by-its-code → expected-failure-carries-a-stable-code · MUST

A failure of a request is answered from what failed. An expected error gets the answer its code maps to, carrying its code and details; a refusal the framework raises before the operation runs — a refused input, an unknown operation — is answered as the caller's failure of that kind, a refused input naming the path of each field it refused; and any other failure as an internal error.

| Why |
|---|
| a caller with no stable code to branch on parses messages that break when they are reworded, and a refusal answered in the framework's own shape is one more shape every client must parse. |

### unexpected-failure-answered-masked → failure-shown-as-what-happened-and-what-next · MUST

An unexpected failure is answered masked. A failure that is neither an expected error nor a refusal of the caller's input reaches the caller with no message, class, trace or cause of it.

| Why |
|---|
| an unexpected failure's message and trace tell an attacker how the program works and which of its parts broke. |

### failure-answer-names-its-occurrence · SHOULD

Every failure answer names its occurrence. It carries an identifier of its occurrence, such as its trace id, that finds its record in the program's logs, and a masked answer carries one too.

| Why |
|---|
| a masked answer otherwise leaves a caller nothing to quote to support, and support nothing to search for. |

## Raising

### error-carries-a-code-never-a-status → expected-failure-carries-a-stable-code · MUST

An error carries a code, never a status. Whatever the program raises while serving a request holds no status or answer of the protocol: it is neither the framework's error nor an error of the program's own that holds a status.

| Why |
|---|
| a status chosen where the error is raised ties that code to one protocol, and the answer is then decided in two places that drift apart. |

## Requirements for implementation

### framework-passes-every-failure-to-one-handler · MUST

The server framework passes every failure of a request to one handler. The handler is one the program registers, the failures include an operation's, a refused input and an unknown operation, and the framework answers none of them in a shape of its own.

| Why |
|---|
| without it, some failures leave in the framework's shape, unmasked, and the one handler cannot be written. |
