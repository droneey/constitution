# AI

> Governs a language model's answer as it streams onto a screen: how a person stops it and what a stopped one keeps.

## Streaming

### streamed-answer-can-be-stopped → outside-call-can-be-cancelled · SHOULD

Every answer streaming onto a screen can be stopped by the person, and stopping it cancels the call to the language model.

| Why |
|---|
| a person who sees an answer go wrong and cannot stop it waits and pays for the rest of it. |

### stopped-answer-keeps-what-it-showed → streamed-output-marked-unfinished · MUST

Every streamed answer the person stops keeps what it showed on the screen, marked as unfinished.

| Why |
|---|
| an answer erased when stopped takes with it the part the person already read and wanted. |
