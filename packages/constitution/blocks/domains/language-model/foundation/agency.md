# Agency

> Governs the tools a language model the product runs may call, the rights they act with, and the calls that wait for a person.

## Tools

### model-given-only-the-tools-its-task-needs · MUST

A language model is given only the tools its task needs. Each is as narrow as the task — a search over one index, not a query in any language — and no tool whose definition arrived with the request is given.

| Why |
|---|
| every tool a language model holds is one that text it reads can make it call, so the set it holds is the most an injection can do — least privilege. |

### outside-tool-definition-pinned → agent-extension-pinned · MUST

A tool of another server is offered to a language model only as the definition last reviewed.

| Why |
|---|
| a tool's description is a prompt its server can rewrite at any time, so one approved once can turn against the language model later. |

## Rights

### tool-acts-with-the-persons-rights → credential-has-least-privilege · MUST

A tool a language model calls acts with the rights of the person the model acts for. In a run with no person present it acts with a service identity scoped to that run's task. The system it reaches checks those rights, the tool never acts with a credential that can do more, and whether an action is allowed is never the model's decision.

| Why |
|---|
| a language model is steered by what it reads, so a tool with more rights than its person lends them to whoever wrote that text — least privilege. |

## Approval

### consequential-tool-call-approved-by-its-person · MUST

A consequential tool call runs only on its person's approval. A call that destroys data, spends money, changes another system or sends something in a person's name runs only after that person approves that call, shown with the arguments it will run with, or, in a run with no person present, only within a standing grant its owner declared — the action, its bounds and its expiry — checked by code outside the language model and recorded per call. A call that only reads, from an address the program chose, needs no approval.

| Why |
|---|
| the person answers for the action, so a call run on the language model's word alone acts in their name on whatever steered the model, and an approval shown without the actual arguments approves a call other than the one that runs. |

## Ways out

### agent-reading-untrusted-text-sends-nothing-out-unapproved · MUST

An agent that reads untrusted text and can reach private data sends nothing out unapproved. Text is untrusted when others wrote it; a send — a request to an address the language model chooses, a message, a shared file — waits for a person's approval of that send, and in a run with no person present goes only to the addresses its standing grant names.

| Why |
|---|
| text others wrote, private data and a way out together let whoever wrote the text take the data — the lethal trifecta. |

## Code

### generated-code-runs-only-in-a-sandbox · MUST

Code a language model writes runs only in a sandbox. That code or command runs with no credential, no network beyond an allowlist and bounds on time and memory, never in the program's own process or on its host.

| Why |
|---|
| code a language model writes is written by whoever steered the model, and it runs with every right of the place it runs in. |
