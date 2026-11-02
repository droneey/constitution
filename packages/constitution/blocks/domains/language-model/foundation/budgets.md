# Budgets

> Governs the time, tokens, steps and money a language-model call, a run and a caller may spend.

## Calls

### model-call-bounds-its-output-and-its-time → outside-call-has-a-timeout · MUST

Every language-model call bounds its output and its time. It sets the most tokens its output may take, sized to its task, and a timeout of its own, never its library's default; a stream also bounds the wait between two chunks.

| Why |
|---|
| an output with no limit runs to the language model's maximum, at the price and the latency of the longest answer, and a library's default timeout suits the longest generation it supports, often minutes, while a stream that stalls without closing holds its caller until then. |

### model-input-bounded-before-the-call → outside-input-bounded-before-it-is-parsed · MUST

Text sent toward a language model is bounded before the call. Text a caller sends is refused past a length the project sets before any call is made, and the conversation and documents added to it are cut to a token budget the program counts.

| Why |
|---|
| every token sent is paid for and slows the answer, and a caller who chooses the length chooses the cost. |

## Runs

### agent-run-bounded-in-steps-and-tokens · MUST

An agent's run is bounded in steps, tool calls, tokens and time. It stops at the most of each the project sets for it, time counted on the wall clock, and a run stopped at a bound ends with an expected failure that says so, never with a partial answer presented as complete.

| Why |
|---|
| a language model can loop on a tool for ever, and a run without bounds spends until something outside kills it. |

## Callers

### spend-bounded-per-caller-and-in-total · MUST

Spending on language models is bounded per caller and in total. The tokens a caller may spend on models are bounded per period, for each caller and for the program in total, and a call past a bound is refused before it reaches the model.

| Why |
|---|
| a language model is paid for per token, so one caller, script or loop can otherwise spend the whole program's budget. |

## Requirements for implementation

### model-client-sets-bounds-and-reports-the-stop · MUST

A library that calls a language model lets each call set its bounds and reports why the output stopped. Each call sets its timeout, its maximum output tokens and its cancellation, and the library reports the model that answered, the tokens used and why the output stopped.

| Why |
|---|
| without them, no call can be held to its budget and no output can be told complete. |
