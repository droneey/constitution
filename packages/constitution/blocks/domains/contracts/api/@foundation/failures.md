# Failures

> Governs how a failure is answered and how it is raised.

## Answers

### failure-answered-by-its-code → expected-failure-carries-a-stable-code · MUST

Every expected failure of a request is answered with the answer its code maps to, carrying its code and its details.

| Why |
|---|
| a caller with no stable code to branch on parses messages that break when they are reworded. |

### framework-refusal-answered-as-the-callers-failure → expected-failure-carries-a-stable-code · MUST

Every refusal the framework raises before an operation runs is answered as the caller's failure of its kind. Such refusals include a refused input and an unknown operation.

| Why |
|---|
| a refusal answered as an internal error tells its caller to retry, unchanged, a request it has to fix. |

### refused-input-answer-names-each-field-by-path · SHOULD

Every answer to a refused input names the path of each field it refused.

| Why |
|---|
| an answer that does not point at the field leaves its caller guessing what to fix. |

### defect-answered-as-an-internal-error → failure-is-expected-or-defect · MUST

Every defect of a request is answered as an internal error.

| Why |
|---|
| a defect answered as the caller's failure tells the caller to change a request that was never wrong, and hides the bug from whoever watches the internal errors. |

### defect-answered-masked → failure-shown-as-what-happened-and-what-next · MUST

Every defect of a request reaches its caller masked, with no message, class, stack trace or cause of it.

| Why |
|---|
| a defect's message and trace tell an attacker how the program works and which of its parts broke. |

### failure-answer-names-its-occurrence · SHOULD

Every failure answer carries an identifier of its occurrence, by which the program's operators find what the program recorded of it.

| Why |
|---|
| a masked answer otherwise leaves a caller nothing to quote to support, and support nothing to search for. |

## Raising

### error-carries-a-code-never-a-status → expected-failure-carries-a-stable-code · MUST

Every error the program raises while serving a request carries a code, never a status or an answer of the protocol.

| Why |
|---|
| a status chosen where the error is raised ties that code to one protocol, and the answer is then decided in two places that drift apart. |
