# Language model with a user interface

> Governs a model's answer as it streams onto a screen.

## Streaming

### streamed-answer-announced-once → status-changes-announced · MUST
A region that receives a streamed answer is marked busy while it streams, so that assistive technology announces the answer once, when it is complete, never chunk by chunk.

| Why | Tags |
|---|---|
| a live region announces each change, and an answer streamed in hundreds of chunks becomes hundreds of interruptions. | [a11y] |

### streamed-answer-can-be-stopped → outside-call-can-be-cancelled · SHOULD
A person can stop an answer while it streams; stopping cancels the model call, and what was shown stays, marked as stopped.

| Why | Tags |
|---|---|
| a person who sees an answer go wrong should neither wait nor pay for the rest of it. | [ux, performance] |
