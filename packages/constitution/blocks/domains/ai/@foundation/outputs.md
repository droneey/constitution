# Outputs

> Governs what a language model returns: how it is parsed, when it is complete, which addresses in it are reached, and what a person is told of it.

## Vocabulary

An **unfinished model output** is an output, or the whole output of a model run, that stopped at its limit of model tokens or at a bound of its run, was refused, filtered or cancelled, or failed its schema.

## Parsing

### model-output-parsed-by-the-programs-schema → outside-value-untyped-until-parsed · MUST

Every output the program acts on is parsed by the program's own closed schema, whatever structure its provider guarantees. Such an output is a choice, a record or a model tool's arguments.

#### Why

A provider's structured output skips the constraints it cannot enforce and breaks on a refusal or a cut, so an output trusted on the provider's word passes on data no schema of the program checked — parse, don't validate.

#### Examples

```pseudo title="Avoid"
let result = model.generate({
  ...ticketTriageCall(ticket),
  responseFormat: ticketTriageFormat,
})
let triage = finishedText(result).json as TicketTriage

call routeTicket(ticket.id, triage.queue)
```

```pseudo title="Prefer"
let ticketTriageSchema = closed {
  queue: "billing" | "shipping" | "returns",
  urgent: boolean,
}

let result = model.generate({
  ...ticketTriageCall(ticket),
  responseFormat: ticketTriageFormat,
})
let triage = ticketTriageSchema.parse(finishedText(result))

call routeTicket(ticket.id, triage.queue)
```

### failed-output-never-repaired-by-guessing · MUST

No output that fails its schema is repaired by guessing what the language model meant.

#### Why

A repair that guesses passes on data the language model never gave, and the program acts on it as if it had.

#### Examples

```pseudo title="Avoid"
function readTriage(text)
  let parsed = ticketTriageSchema.parse(text)

  when parsed
    is Valid then return parsed.value
    is Invalid then return { queue: guessQueue(text), urgent: false }
```

```pseudo title="Prefer"
function readTriage(text)
  let parsed = ticketTriageSchema.parse(text)

  when parsed
    is Valid then return parsed.value
    is Invalid then throw new TriageSchemaError(parsed.problems)
```

## Endings

### output-used-only-when-finished · MUST

Every output is acted on, stored or handed to another step only once the language model ended it of its own accord. Exempt: the text of an unfinished model output, stored with the expected failure it ended in and handed to the model only as the history of its conversation, such as a stopped answer.

#### Why

A cut or refused output often parses and reads like an answer, and the program then acts on half of one.

#### Examples

```pseudo title="Avoid"
let result = model.generate(ticketReplyCall(ticket))

call replies.save(ticket.id, result.text)
```

```pseudo title="Prefer"
let result = model.generate(ticketReplyCall(ticket))

if result.stopReason is not "end" then
  throw new UnfinishedReplyError(ticket.id, result.stopReason)

call replies.save(ticket.id, result.text)
```

### streamed-output-marked-unfinished · MUST

Every output shown before the language model ended it of its own accord is marked as not complete. One still streaming is marked as streaming, and one that stopped, an unfinished model output or one a failed call cut off, as unfinished.

#### Why

A person who reads an answer still streaming, or one that stopped half way, takes the half for the whole answer unless it says it is not complete.

#### Examples

```pseudo title="Avoid"
let text = ""

for chunk in model.stream(ticketReplyCall(ticket))
  text = text + chunk.text
  call view.show({ text })
```

```pseudo title="Prefer"
let text = ""
let stream = model.stream(ticketReplyCall(ticket))

try
  for chunk in stream
    text = text + chunk.text
    call view.show({ text, state: "streaming" })
catch error
  call view.show({ text, state: "unfinished" })
  throw error

call view.show({
  text,
  state: if stream.stopReason is "end" then "complete" else "unfinished",
})
```

### unfinished-output-fails-as-expected → failure-is-expected-or-defect · MUST

Every unfinished model output ends as an expected failure of its own type, never as a complete answer.

#### Why

A caller handed half an answer as a whole one acts on it, while one handed the failure for what it is can ask again, shorten or tell its person.

#### Examples

```pseudo title="Avoid"
function summarizeTicket(ticket, context)
  let result = model.generate(ticketSummaryCall(ticket, context))

  return { summary: result.text }
```

```pseudo title="Prefer"
function summarizeTicket(ticket, context)
  let result = model.generate(ticketSummaryCall(ticket, context))

  if result.stopReason is not "end" then
    throw new UnfinishedSummaryError(ticket.id, result.stopReason)

  return { summary: result.text }
```

### only-schema-failure-asked-again → failure-retried-only-when-transient · MUST

Of unfinished model outputs, only one that failed its schema is asked for again, at most as often as the project sets.

#### Why

A refusal, a filter or a stop at a bound comes back the same on every attempt, so asking again pays for the same failure, while a sample that missed its schema may well pass on the next.

#### Examples

```pseudo title="Avoid"
let maxTriageAttempts = 3

function triageTicket(ticket, context)
  repeat maxTriageAttempts times
    let result = model.generate(ticketTriageCall(ticket, context))
    if result.stopReason is "end" then
      let parsed = ticketTriageSchema.parse(result.text)
      if parsed is Valid then
        return parsed.value

  throw new TriageFailedError(ticket.id)
```

```pseudo title="Prefer"
let maxTriageAttempts = 3

function triageTicket(ticket, context)
  repeat maxTriageAttempts times
    let result = model.generate(ticketTriageCall(ticket, context))
    if result.stopReason is not "end" then
      throw new UnfinishedTriageError(ticket.id, result.stopReason)

    let parsed = ticketTriageSchema.parse(result.text)
    if parsed is Valid then
      return parsed.value

  throw new TriageSchemaError(ticket.id)
```

## Addresses

### output-address-reached-only-from-an-allowlist → outside-address-reached-only-from-an-allowlist · MUST

Every address in a language model's output is made live, loaded or fetched only from the program's allowlist of hosts. A public host is no exception, and every other address is shown as text or dropped.

#### Why

Text the language model read can tell it to write an image whose address, on a public host its writer runs, carries the person's data, and the renderer sends that data when it loads the image.

#### Examples

```pseudo title="Avoid"
function renderAnswer(markdown)
  return markdownToHtml(markdown)
# loads every image the answer names
```

```pseudo title="Prefer"
let answerHosts = ["help.example.com", "cdn.example.com"]

function renderAnswer(markdown)
  return markdownToHtml(markdown, {
    link: url => if answerHosts.contains(url.host) then link(url) else text(url),
    image: url => if answerHosts.contains(url.host) then image(url) else text(url),
  })
```

## Disclosure

### person-told-they-talk-with-a-model · MUST

Wherever the law that binds the product so asks, every person is told before an exchange that a language model answers them. Exempt: an exchange whose context makes it plain.

#### Why

A person weighs an answer by who gave it, and a law such as the EU's AI Act fines a product that lets them take a language model for a person.

#### Examples

```text title="Avoid"
Support chat

Mia:     Hi, I'm Mia. How can I help
         with your order?
```

```text title="Prefer"
Support chat
An AI assistant answers here. Ask for
a person at any time.

Assistant: Hi. How can I help with
           your order?
```

### generated-content-marked-as-generated · MUST

Wherever the law that binds the product asks it, all content its language models generate carries a machine-readable mark that says so. Such content is text, audio, images and video.

#### Why

A notice on the screen stays behind when the file is copied, so the content passes for a person's work wherever it goes next, and Article 50 of the EU AI Act requires the mark from 2 August 2026, or from 2 December 2026 for a system on the market before then.

#### Examples

```pseudo title="Avoid"
function createProductImage(product, context)
  let image = imageModel.generate(productImageCall(product, context))

  return images.save(product.id, image.bytes)
```

```pseudo title="Prefer"
function createProductImage(product, context)
  let image = imageModel.generate(productImageCall(product, context))
  let marked = withGeneratedMark(image.bytes, {
    generator: image.model,
    createdAt: clock.now(),
  })

  return images.save(product.id, marked)
```
