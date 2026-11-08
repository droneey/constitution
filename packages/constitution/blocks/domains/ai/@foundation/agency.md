# Agency

> Governs the model tools a language model the program runs may call, the rights they act with, the calls that wait for a person, what a model run may send and the code a language model writes.

## Vocabulary

A **model tool** is a function the program hands a language model to call, which core's tools chapter counts as no tool.

A **model run** is one model task carried out by a language model that calls model tools in turn until it answers or stops, for the person it acts for, its person; one with no person present, such as one a schedule starts, is an **unattended run**.

A **run grant** is a record, kept by the program, that the person a model run acts for or the project sets in advance to bound an unattended run: its model task, the actions it allows, their bounds and its expiry.

A **consequential tool call** is a model tool call that destroys data, spends money, changes another system or sends something in a person's name.

## Tools

### model-given-only-the-tools-its-task-needs · MUST

Every model run is given model tools that reach no further than its model task needs. Each is as narrow as that task, such as a search over one index, never a query in any language.

| Why |
|---|
| every model tool a language model holds is one that text it reads can make it call, so the reach of the set it holds is the most an injection can do — least privilege. |

### outside-tool-definition-pinned · MUST

Every model tool offered to a language model has the definition the program last reviewed. No definition that arrived with the request is offered.

| Why |
|---|
| a model tool's description is a prompt its author can write or rewrite at any time, so a definition sent with the request or changed on its server since its review turns the language model against its own program. |

## Rights

### tool-acts-with-the-persons-rights → credential-has-least-privilege · MUST

Every model tool a language model calls acts with no more rights than the person its model run acts for. Exempt: an unattended run that acts for no person, whose model tools act with a service identity scoped to its model task.

| Why |
|---|
| a language model is steered by what it reads, so a model tool with more rights than its person lends them to whoever wrote that text — least privilege. |

## Approval

### consequential-tool-call-approved-by-its-person · MUST

Every consequential tool call runs only once its person approves it. The approval is given for that call alone and shows it with the arguments it will run with. Exempt: a call of an unattended run, which runs only within its run grant.

| Why |
|---|
| the person answers for the action, so a call run on the language model's word alone acts in their name on whatever steered the model, and an approval shown without the actual arguments approves a call other than the one that runs. |

### unattended-tool-call-recorded · MUST

Every consequential tool call an unattended run makes within its run grant is recorded, call by call.

| Why |
|---|
| no person saw the call when it ran, so a call left unrecorded cannot be checked against the grant, answered for or undone. |

## Ways out

### model-run-reading-outside-input-sends-nothing-unapproved · MUST

Wherever a model run reads outside input and can reach private data, every send it makes waits for its person's approval. A send is a request to an address the language model chooses, a message or a shared file, and private data is the agents chapter's term. Exempt: an unattended run's send to an address its run grant names.

| Why |
|---|
| text others wrote, private data and a way out together let whoever wrote the text take the data — the lethal trifecta. |

## Code

### generated-code-runs-only-in-isolation · MUST

Every piece of code a language model writes runs only in isolation, never in the program's process or on its host. A command line it writes is such code, and isolation holds no credential, reaches no network beyond an allowlist and is bounded in time and in the memory it may allocate.

| Why |
|---|
| code a language model writes is written by whoever steered the model, and it runs with every right of the place it runs in. |
