# Budgets

> Governs the time, model tokens and steps a language-model call, a model run and a caller may spend.

## Vocabulary

A **model token** is a unit of the text a language model reads and writes, by which its input, its output and their price are counted.

## Calls

### model-output-bounded-in-tokens · MUST

Every language-model call sets the most model tokens its output may take, sized to its model task.

| Why |
|---|
| an output with no limit runs to the language model's maximum, at the price and the latency of the longest answer. |

### model-call-timeout-sized-to-its-task → outside-call-has-a-timeout · MUST

Every language-model call sets a timeout sized to its model task, never its library's default.

| Why |
|---|
| a library's default timeout suits the longest generation it supports, often minutes, so a call that hangs holds its caller until then. |

### model-stream-bounds-the-wait-between-chunks → outside-call-has-a-timeout · MUST

Every streamed language-model call bounds the wait between two of its chunks.

| Why |
|---|
| a stream that stalls without closing holds its caller until its whole timeout runs out, long after the first missing chunk showed it had stopped. |

### model-input-bounded-before-the-call → outside-input-bounded-before-it-is-parsed · MUST

All text a caller sends toward a language model is refused past a length the project sets, before any call is made.

| Why |
|---|
| every model token sent is paid for and slows the answer, and a caller who chooses the length chooses the cost. |

### model-context-cut-to-a-token-budget · MUST

All context the program adds to a prompt is cut to a budget of model tokens the program counts. Such context includes the conversation and its documents.

| Why |
|---|
| a conversation and its documents grow with every turn, so context left uncut makes each call cost more than the last until it passes the language model's window and fails. |

## Runs

### model-run-bounded · MUST

Every model run stops at the most steps, model tool calls, model tokens and elapsed time the project sets for it.

| Why |
|---|
| a language model can loop on a model tool for ever, and a run without bounds spends until something outside kills it. |

## Callers

### model-spend-bounded-per-caller · MUST

Every caller's spending on language models is bounded in model tokens per period. A call past the bound is refused before it reaches the model.

| Why |
|---|
| a language model is paid for per model token, so one caller, script or loop can otherwise spend the whole program's budget. |

### model-spend-bounded-in-total · MUST

All of the program's spending on language models is bounded in model tokens per period. A call past the bound is refused before it reaches the model.

| Why |
|---|
| bounds per caller add up to no limit when callers are many or new ones appear, so without a total one surge spends past what the program can pay. |
