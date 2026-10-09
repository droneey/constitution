# Budgets

> Governs the time, tokens, steps and money a model call, a run and a caller may spend.

## Calls

### model-call-sets-its-output-limit · MUST
Every model call sets the most tokens its output may take, sized to its task.

| Why | Tags |
|---|---|
| an output with no limit runs to the model's maximum, at the price and the latency of the longest answer. | [performance] |

### model-call-sets-its-own-timeout → outside-call-has-a-timeout · MUST
Every model call sets a timeout of its own, never its library's default, and a streamed call also bounds the wait between two chunks.

| Why | Tags |
|---|---|
| a library's default suits the longest generation it supports, often minutes, and a stream that stalls without closing holds its caller until then. | [errors, performance] |

### model-input-bounded-before-the-call → outside-input-bounded-before-it-is-parsed · MUST
Text a caller sends toward a model is refused past a length the project sets before any call is made, and the conversation and documents added to it are cut to a token budget the program counts.

| Why | Tags |
|---|---|
| every token sent is paid for and slows the answer, and a caller who chooses the length chooses the cost. | [security, performance] |

## Runs

### agent-run-bounded-in-steps-and-tokens · MUST
An agent's run stops at the most steps, tool calls and tokens the project sets for it, and a run stopped at a bound ends with an expected failure that says so, never with a partial answer presented as complete.

| Why | Tags |
|---|---|
| a model can loop on a tool for ever, and a run without bounds spends until something outside kills it. | [performance, errors] |

## Callers

### spend-bounded-per-caller-and-in-total · MUST
The tokens a caller may spend on models are bounded per period, for each caller and for the program in total, and a call past a bound is refused before it reaches the model.

| Why | Tags |
|---|---|
| a model is paid for per token, so one caller, script or loop can otherwise spend the whole program's budget. | [security, performance] |
