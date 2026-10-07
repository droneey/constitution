# Agency

> Governs the tools a model may call, the rights they act with, and the calls that wait for a person.

## Tools

### model-given-only-the-tools-its-task-needs · MUST
A model is given only the tools its task needs, each as narrow as the task — a search over one index, not a query in any language — and never a tool whose definition arrived with the request.

| Why | Tags |
|---|---|
| every tool a model holds is one that text it reads can make it call, so the set it holds is the most an injection can do. | [security] |

### outside-tool-definition-pinned · MUST
A tool of another server is offered to a model only as the definition last reviewed, and a definition that changed is withheld until it is reviewed again.

| Why | Tags |
|---|---|
| a tool's description is a prompt its server can rewrite at any time, so one approved once can turn against the model later. | [security] |

## Rights

### tool-acts-with-the-persons-rights → credential-has-least-privilege · MUST
A tool a model calls acts with the rights of the person the model acts for, or in a run with no person present with a service identity scoped to that run's task, checked by the system it reaches, never with a credential that can do more; whether an action is allowed is never the model's decision.

| Why | Tags |
|---|---|
| a model is steered by what it reads, so a tool with more rights than its person lends them to whoever wrote that text. | [security] |

## Approval

### consequential-tool-call-approved-by-its-person → irreversible-operation-runs-dry-by-default · MUST
A tool call that destroys data, spends money, changes another system or sends something in a person's name runs only after that person approves that call, shown with the arguments it will run with, or, in a run with no person present, only within a standing grant its owner declared — the action, its bounds and its expiry — checked by code outside the model and recorded per call; a call that only reads needs no approval.

| Why | Tags |
|---|---|
| the person answers for the action, and only the actual arguments show them what the model is about to do. | [security, ux] |

## Ways out

### agent-reading-untrusted-text-sends-nothing-out-unapproved · MUST
An agent that reads text others wrote and can reach private data sends nothing outward — a request to an address the model chooses, a message, a shared file — without a person's approval of that send; in a run with no person present a standing grant never stands in for it, and the run sends only to the addresses its grant names.

| Why | Tags |
|---|---|
| text others wrote, private data and a way out together let whoever wrote the text take the data, as core holds for an agent at work on the repository. | [security, data] |

## Code

### generated-code-runs-only-in-a-sandbox · MUST
Code or a command a model writes runs only in a sandbox — no credential, no network beyond an allowlist, bounds on time and memory — never in the program's own process or on its host.

| Why | Tags |
|---|---|
| code a model writes is written by whoever steered the model, and it runs with every right of the place it runs in. | [security] |

## Memory

### memory-keeps-its-source-and-person · SHOULD
What an agent writes to its memory from text others wrote keeps its source, is scoped to its person, and is read back as content, never as instructions.

| Why | Tags |
|---|---|
| memory written from a poisoned page steers every later run that reads it, unseen. | [security] |
