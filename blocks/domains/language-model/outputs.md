# Outputs

> Governs what a model returns: how it is parsed, when it is complete, and what of it is followed or shown.

## Parsing

### model-output-parsed-by-the-programs-schema → outside-value-untyped-until-parsed · MUST
An output the program acts on — a choice, a record, a tool's arguments — is asked for in a structured format where the provider offers one, and parsed by the program's own closed schema before it is used, whatever the provider guarantees; an output that fails is never repaired by guessing.

| Why | Tags |
|---|---|
| a provider's structured output skips the constraints it cannot enforce and breaks on a refusal or a cut, and a repair that guesses passes on data the model never gave. | [security, data] |

## Endings

### output-used-only-when-finished → failure-is-expected-or-defect · MUST
An output is acted on, stored as an answer or handed to another step only when the model stopped because it had finished; a stream may be shown as it arrives, marked unfinished until it ends; a stop at the token limit, a refusal, a content filter or an output that fails its schema is an expected failure of its own type, asked again at most the number of times the project sets.

| Why | Tags |
|---|---|
| a cut or refused output often parses and reads like an answer, and the program then acts on half of one. | [errors] |

## Addresses

### output-address-followed-only-from-an-allowlist → outside-address-followed-only-from-an-allowlist · MUST
A link, an image or any other address in a model's output is made live, loaded or fetched only when its host is on the program's allowlist; any other is shown as text or dropped.

| Why | Tags |
|---|---|
| text the model read can tell it to write an image whose address carries the person's data, and the renderer sends that data when it loads the image. | [security] |

## Disclosure

### person-told-they-talk-with-a-model · MUST
A person who exchanges messages or speech with a model is told so before the exchange begins, unless the context makes it plain, wherever the law of the region the product serves makes it binding, as the EU's AI Act does from 2 August 2026.

| Why | Tags |
|---|---|
| a person weighs an answer by who gave it, and the law fines a product that lets them take a model for a person. | [ux] |

### generated-media-marked-as-generated · MUST
Audio, images and video the program generates carry a machine-readable mark that they were generated, where the law that binds the product asks it, such as Article 50 of the EU AI Act from 2 August 2026.

| Why | Tags |
|---|---|
| a mark travels with the file where a notice on the screen does not. | [ux] |
