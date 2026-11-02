# Prompts

> Governs the text a program sends a language model: its instructions, the text others wrote, and what it may hold.

## Instructions

### prompt-text-versioned-with-the-code · MUST

A prompt's fixed text is versioned with the code. Its instructions, its examples and the descriptions of its tools are a file of the repository, never built from stored data or edited in a provider's console.

| Why |
|---|
| the language model obeys this text as it would the program's code, and a prompt changed outside the repository escapes the evals and the history that explains a regression. |

### prompt-never-the-only-control · MUST

A prompt is never the only control. What the program must enforce — who may see or do what, what an answer must never contain — is enforced by code outside the language model; an instruction in the prompt may add to that code, never replace it.

| Why |
|---|
| a language model can be talked out of any instruction, and a rule held only by the prompt fails the first time someone does so. |

## Untrusted text

### untrusted-text-reaches-the-prompt-as-content → outside-input-reaches-interpreters-as-parameters · MUST

Text others wrote reaches a prompt only as content. Such text — a person's message, a document, a page, a tool's answer, another language model's output — comes as user or tool content, inside delimiters that name its source, never formatted into the system instructions.

| Why |
|---|
| a language model takes instructions from whatever reads as instructions, so text formatted into the system instructions steers it as the program's own. |

### prompt-holds-no-secret → secret-kept-out-of-output · MUST

A prompt holds no secret and nothing the person it answers may not read. It holds no key, password, connection string or internal address, and no data the person the language model answers may not read.

| Why |
|---|
| a language model can be made to repeat its prompt, so whatever the prompt holds, the person talking to it can read. |

## Caching

### prompt-prefix-stable · SHOULD

A prompt keeps a stable prefix. It orders its parts from the least changing to the most — tool definitions, instructions, examples, then documents and the conversation — and keeps that prefix the same byte for byte between calls; a value that changes on each call, such as the time, comes after it.

| Why |
|---|
| a provider's cache matches only an exact prefix, and a value that changes near its start makes every call pay the full price and latency of the whole prompt. |
