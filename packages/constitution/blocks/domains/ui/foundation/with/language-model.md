# Language model

> Governs a model's answer as it streams onto a screen: how assistive technology hears it and how a person stops it.

## Streaming

### streamed-answer-announced-once · MUST

A streamed answer sits outside any live region, so assistive technology never announces it chunk by chunk; a separate status message announces once that the answer is coming and once that it is complete.

| Why | Tags |
|---|---|
| a live region announces each change, and an answer streamed in hundreds of chunks becomes hundreds of interruptions. | [a11y] |

### streamed-answer-can-be-stopped → outside-call-can-be-cancelled · SHOULD

A person can stop an answer while it streams; stopping cancels the model call, and what was shown stays, marked as stopped.

| Why | Tags |
|---|---|
| a person who sees an answer go wrong should neither wait nor pay for the rest of it. | [ux, performance] |
