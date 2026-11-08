# Prompts

> Governs the text a program sends a language model: where its instructions are kept and how the program reads them, the outside input it carries, what it may hold, its prefix and whether its text reaches telemetry.

## Vocabulary

A **prompt registry** is a store outside the repository that keeps every version of a prompt's fixed text unchanged once saved and points labels at versions, such as the one production reads.

## Instructions

### prompt-text-kept-in-immutable-versions · MUST

Every prompt's fixed text is an unchanging version, kept in the repository or in one prompt registry. It is never built from stored data. Its fixed text is its instructions, its examples and the descriptions of its model tools.

#### Why

The language model obeys this text as it would the program's code, and a prompt edited in place escapes the evals and the history that explains a regression.

#### Examples

```pseudo title="Avoid"
function triagePrompt(ticket)
  let instructions = adminSettings.get("triage_instructions")

  return { system: instructions, messages: [userMessage(ticket.body)] }
```

```pseudo title="Prefer"
let triageInstructions = readFile("prompts/triage-ticket.v14.md")

function triagePrompt(ticket)
  return { system: triageInstructions, messages: [userMessage(ticket.body)] }
```

### registry-prompt-read-by-its-label · MUST

Every prompt the program takes from a prompt registry it reads by a label, never as the newest version saved.

#### Why

A label moves to a version only when its eval passes, while the newest version is whatever was saved last, so a program reading it runs text nobody measured.

#### Examples

```pseudo title="Avoid"
let triagePrompt = promptRegistry.get("triage-ticket", { version: "latest" })
```

```pseudo title="Prefer"
let triagePrompt = promptRegistry.get("triage-ticket", { label: "production" })
```

### prompt-never-the-only-control · MUST

No prompt is the only control of what the program enforces. Who may see or do what, and what an answer never contains, are enforced by code outside the language model, which an instruction in the prompt adds to and never replaces.

#### Why

A language model can be talked out of any instruction, and a rule held only by the prompt fails the first time someone does so.

#### Examples

```pseudo title="Avoid"
let supportInstructions = "Never show a customer another customer's order."

function answerOrderQuestion(question, context)
  let orders = orderQueries.search(question.text, context)

  return assistant.answer(supportInstructions, question, orders, context)
```

```pseudo title="Prefer"
let supportInstructions = "Never show a customer another customer's order."

function answerOrderQuestion(question, context)
  let orders = orderQueries.search(question.text, {
    customerId: context.actor.customerId,
  }, context)

  return assistant.answer(supportInstructions, question, orders, context)
```

## Outside input

### untrusted-text-reaches-the-prompt-as-content → outside-input-reaches-interpreters-as-parameters · MUST

All outside input reaches a prompt only as a person's or a model tool's message, never formatted into its system instructions. Such input includes a person's message, a document, a page, a model tool's answer, another language model's output and a model memory written from any of them.

#### Why

A language model takes instructions from whatever reads as instructions, so text formatted into the system instructions steers it as the program's own.

#### Examples

```pseudo title="Avoid"
let prompt = {
  system: "Summarize this ticket for an agent:\n" + ticket.body,
}
```

```pseudo title="Prefer"
let prompt = {
  system: "Summarize the ticket in the next message for an agent.",
  messages: [{ role: "user", content: ticket.body }],
}
```

## What it holds

### prompt-holds-no-secret → secret-kept-out-of-output · MUST

No prompt holds a secret, such as a key, a password or a connection string.

#### Why

A prompt leaves the program for its provider and a language model can be made to repeat it, so whatever secret it holds, the person talking to it can read.

#### Examples

```pseudo title="Avoid"
let supportInstructions =
  "Look orders up with the find_order tool, passing the key "
    + config.ordersApiKey + "."
```

```pseudo title="Prefer"
let supportInstructions = "Look orders up with the find_order tool."

let findOrder = modelTool("find_order", function(args, run)
  return ordersClient.find(args.orderNumber, run.person.credentials))
```

### prompt-holds-only-what-its-person-may-read · MUST

Every prompt holds only what the person the language model answers may read. Nothing that person may not read, such as another person's record or an internal address, is added to it.

#### Why

A language model can be made to repeat its prompt, so whatever the prompt holds, the person talking to it can read.

#### Examples

```pseudo title="Avoid"
let prompt = supportPrompt({
  order: order,   # carries its fraud score and staff notes
  question,
})
```

```pseudo title="Prefer"
let prompt = supportPrompt({
  order: {
    number: order.number,
    status: order.status,
    lines: order.lines,
  },
  question,
})
```

## Prefix

### prompt-prefix-stable · SHOULD

Every prompt keeps the same prefix, byte for byte, between the calls of its model task. Its parts run from the least changing to the most, model tool definitions, instructions and examples before documents and the conversation, and a value that changes on each call, such as the time, comes after the prefix.

#### Why

A provider's cache matches only an exact prefix, and a value that changes near its start makes every call pay the full price and latency of the whole prompt.

#### Examples

```pseudo title="Avoid"
let prompt = {
  system: "Today is " + clock.now() + ". " + supportInstructions,
  tools: supportTools,
  messages: conversation.turns,
}
```

```pseudo title="Prefer"
let prompt = {
  tools: supportTools,
  system: supportInstructions,
  messages: conversation.turns + [
    { role: "user", content: "Today is " + clock.today() + "." },
  ],
}
```

## Telemetry

### prompt-text-kept-out-of-telemetry · MUST

All text of prompts and outputs stays out of logs, traces and metrics by default. It reaches them only through a setting that is off by default.

#### Why

Prompts carry what people typed, the documents they hold and the business's own text, and telemetry keeps that text longer and shows it to more people.

#### Examples

```pseudo title="Avoid"
log.info("ticket triaged", {
  ticketId: ticket.id,
  prompt: prompt.messages,
  output: result.text,
})
```

```pseudo title="Prefer"
let telemetrySettings = { recordModelText: false }

log.info("ticket triaged", {
  ticketId: ticket.id,
  stopReason: result.stopReason,
})

if telemetrySettings.recordModelText then
  log.debug("triage text", {
    prompt: maskPersonalData(prompt.messages),
    output: maskPersonalData(result.text),
  })
```
