# Prompts

> Governs the text a program sends a model: its instructions, the text others wrote, what it may hold and where its text may go.

## Instructions

### prompt-text-versioned-with-the-code · MUST

A prompt's fixed text — its instructions, its examples and the descriptions of its tools — is a file of the repository, versioned with the code, never built from stored data or edited in a provider's console.

| Why |
|---|
| the model obeys this text as it would the program's code, and a prompt changed outside the repository escapes the evals and the history that explains a regression. |

### prompt-never-the-only-control · MUST

What the program must enforce — who may see or do what, what an answer must never contain — is enforced by code outside the model; an instruction in the prompt may add to that code, never replace it.

| Why |
|---|
| a model can be talked out of any instruction, and a rule held only by the prompt fails the first time someone does so. |

## Untrusted text

### untrusted-text-reaches-the-prompt-as-content → outside-input-reaches-interpreters-as-parameters · MUST

Text others wrote — a person's message, a document, a page, a tool's answer, another model's output — reaches a prompt only as user or tool content, inside delimiters that name its source, never formatted into the system instructions.

| Why |
|---|
| a model takes instructions from whatever reads as instructions, and only the place and the label of a text tell it apart from the program's own. |

### prompt-holds-no-secret → secret-and-personal-data-kept-out-of-output · MUST

A prompt holds no secret — no key, password, connection string or internal address — and no data the person the model answers may not read.

| Why |
|---|
| a model can be made to repeat its prompt, so whatever the prompt holds, the person talking to it can read. |

## Telemetry

### prompt-text-kept-out-of-telemetry → secret-and-personal-data-kept-out-of-output · MUST

The text of prompts and outputs reaches logs, traces and metrics only through a setting that is off by default, and is masked of personal data when the setting is on.

| Why |
|---|
| prompts carry what people typed and the documents they hold, and telemetry keeps that text longer and shows it to more people. |

## Caching

### prompt-prefix-stable · SHOULD

A prompt orders its parts from the least changing to the most — tool definitions, instructions, examples, then documents and the conversation — and keeps that prefix the same byte for byte between calls; a value that changes on each call, such as the time, comes after it.

| Why |
|---|
| a provider's cache matches only an exact prefix, and a value that changes near its start makes every call pay the full price and latency of the whole prompt. |
