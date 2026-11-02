# Language model

> Governs a language model's answer as it streams onto a screen: how assistive technology hears it and how a person stops it.

## Streaming

### streamed-answer-announced-once · MUST

A streamed answer is never announced chunk by chunk. It sits outside any live region, and a separate status message announces once that the answer is coming and once that it is complete.

| Why |
|---|
| a live region announces each change, and an answer streamed in hundreds of chunks becomes hundreds of interruptions. |

### streamed-answer-can-be-stopped → outside-call-can-be-cancelled · SHOULD

A person can stop an answer while it streams. Stopping cancels the call to the language model, and what was shown stays, marked as stopped.

| Why |
|---|
| a person who sees an answer go wrong and cannot stop it waits and pays for the rest of it. |
