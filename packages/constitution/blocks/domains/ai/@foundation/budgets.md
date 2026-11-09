# Budgets

> Governs the time, model tokens and steps a language-model call, a model run and a caller may spend.

## Vocabulary

A **model token** is a unit of the text a language model reads and writes, by which its input, its output and their price are counted.

## Calls

### model-output-bounded-in-tokens · MUST

Every language-model call sets the most model tokens its output may take, sized to its model task.

#### Why

An output with no limit runs to the language model's maximum, at the price and the latency of the longest answer.

#### Examples

```pseudo title="Avoid"
let result = model.generate({
  model: "writer-2025-06-01",
  prompt: ticketSummaryPrompt(ticket),
  timeout: 20 seconds,
})
```

```pseudo title="Prefer"
let result = model.generate({
  model: "writer-2025-06-01",
  prompt: ticketSummaryPrompt(ticket),
  maxOutputTokens: 300,
  timeout: 20 seconds,
})
```

### model-call-timeout-sized-to-its-task → outside-call-has-a-timeout · MUST

Every language-model call sets a timeout sized to its model task, never its library's default.

#### Why

A library's default timeout suits the longest generation it supports, often minutes, so a call that hangs holds its caller until then.

#### Examples

```pseudo title="Avoid"
let triage = model.generate({
  model: "writer-mini-2025-04-15",
  prompt: ticketTriagePrompt(ticket),
  maxOutputTokens: 50,
})
# waits for the library's default of ten minutes
```

```pseudo title="Prefer"
let triage = model.generate({
  model: "writer-mini-2025-04-15",
  prompt: ticketTriagePrompt(ticket),
  maxOutputTokens: 50,
  timeout: 5 seconds,
})

let reply = model.generate({
  model: "writer-2025-06-01",
  prompt: ticketReplyPrompt(ticket),
  maxOutputTokens: 800,
  timeout: 45 seconds,
})
```

### model-stream-bounds-the-wait-between-chunks → outside-call-has-a-timeout · MUST

Every streamed language-model call bounds the wait between two of its chunks.

#### Why

A stream that stalls without closing holds its caller until its whole timeout runs out, long after the first missing chunk showed it had stopped.

#### Examples

```pseudo title="Avoid"
let stream = model.stream({
  model: "writer-2025-06-01",
  prompt: ticketReplyPrompt(ticket),
  maxOutputTokens: 800,
  timeout: 60 seconds,
})

for chunk in stream
  draft = draft + chunk.text
```

```pseudo title="Prefer"
let stream = model.stream({
  model: "writer-2025-06-01",
  prompt: ticketReplyPrompt(ticket),
  maxOutputTokens: 800,
  timeout: 60 seconds,
  chunkTimeout: 10 seconds,
})

for chunk in stream
  draft = draft + chunk.text
```

### model-input-bounded-before-the-call → outside-input-bounded-before-it-is-parsed · MUST

All text a caller sends toward a language model is refused past a length the project sets, before any call is made.

#### Why

Every model token sent is paid for and slows the answer, and a caller who chooses the length chooses the cost.

#### Examples

```pseudo title="Avoid"
function summarizeTicket(ticket, context)
  return ticketSummarizer.summarize(ticket.body, context)
```

```pseudo title="Prefer"
let maxTicketCharacters = 20000

function summarizeTicket(ticket, context)
  if ticket.body.length > maxTicketCharacters then
    throw new TicketTooLongError(ticket.id, maxTicketCharacters)

  return ticketSummarizer.summarize(ticket.body, context)
```

### model-context-cut-to-a-token-budget · MUST

All context the program adds to a prompt is cut to a budget of model tokens the program counts. Such context includes the conversation and its documents.

#### Why

A conversation and its documents grow with every turn, so context left uncut makes each call cost more than the last until it passes the language model's window and fails.

#### Examples

```pseudo title="Avoid"
function buildSupportPrompt(conversation, documents)
  return {
    instructions: supportInstructions,
    history: conversation.turns,
    documents: documents,
  }
```

```pseudo title="Prefer"
let historyTokenBudget = 4000
let documentTokenBudget = 6000

function buildSupportPrompt(conversation, documents, tokenizer)
  return {
    instructions: supportInstructions,
    history: latestWithin(conversation.turns, historyTokenBudget, tokenizer),
    documents: bestWithin(documents, documentTokenBudget, tokenizer),
  }
```

## Runs

### model-run-bounded · MUST

Every model run stops at the most steps, model tool calls, model tokens and elapsed time the project sets for it.

#### Why

A language model can loop on a model tool for ever, and a run without bounds spends until something outside kills it.

#### Examples

```pseudo title="Avoid"
function runRefundAgent(request, tools, context)
  let run = startRun(request, tools)

  while not run.answered
    run = step(run, context)

  return run.answer
```

```pseudo title="Prefer"
let refundRunBounds = {
  maxSteps: 12,
  maxToolCalls: 20,
  maxTokens: 40000,
  maxDuration: 2 minutes,
}

function runRefundAgent(request, tools, context)
  let run = startRun(request, tools)

  while not run.answered
    if run.exceeds(refundRunBounds) then
      throw new RunBoundReachedError(run.id, run.boundReached)
    run = step(run, context)

  return run.answer
```

## Callers

### model-spend-bounded-per-caller · MUST

Every caller's spending on language models is bounded in model tokens per period. A call past the bound is refused before it reaches the model.

#### Why

A language model is paid for per model token, so one caller, script or loop can otherwise spend the whole program's budget.

#### Examples

```pseudo title="Avoid"
function askAssistant(question, caller, context)
  let answer = assistant.answer(question, context)

  call usage.record(caller.id, answer.usage.totalTokens)
  return answer
```

```pseudo title="Prefer"
let callerDailyTokens = 200000

function askAssistant(question, caller, context)
  if usage.tokensToday(caller.id) >= callerDailyTokens then
    throw new CallerSpendLimitError(caller.id)

  let answer = assistant.answer(question, context)

  call usage.record(caller.id, answer.usage.totalTokens)
  return answer
```

### model-spend-bounded-in-total · MUST

All of the program's spending on language models is bounded in model tokens per period. A call past the bound is refused before it reaches the model.

#### Why

Bounds per caller add up to no limit when callers are many or new ones appear, so without a total one surge spends past what the program can pay.

#### Examples

```pseudo title="Avoid"
let callerDailyTokens = 200000

function askAssistant(question, caller, context)
  if usage.tokensToday(caller.id) >= callerDailyTokens then
    throw new CallerSpendLimitError(caller.id)

  return assistant.answer(question, context)
```

```pseudo title="Prefer"
let callerDailyTokens = 200000
let programDailyTokens = 50000000

function askAssistant(question, caller, context)
  if usage.tokensToday(caller.id) >= callerDailyTokens then
    throw new CallerSpendLimitError(caller.id)
  if usage.tokensTodayInTotal() >= programDailyTokens then
    throw new ProgramSpendLimitError()

  return assistant.answer(question, context)
```
