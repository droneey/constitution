# Outputs

> Governs what a language model returns: how it is parsed, when it is complete, and what of it is followed or shown.

## Parsing

### model-output-parsed-by-the-programs-schema → outside-value-untyped-until-parsed · MUST

An output the program acts on is parsed by the program's own schema. Such an output — a choice, a record, a tool's arguments — is asked for in a structured format where the provider offers one, and parsed by the program's closed schema before it is used, whatever the provider guarantees; an output that fails is never repaired by guessing.

| Why |
|---|
| a provider's structured output skips the constraints it cannot enforce and breaks on a refusal or a cut, and a repair that guesses passes on data the language model never gave — parse, don't validate. |

## Endings

### output-used-only-when-finished → failure-is-expected-or-defect · MUST

An output is used only once the language model finished it. It is acted on, stored as an answer or handed to another step only when the model stopped because it had finished; a stream may be shown as it arrives, marked unfinished until it ends. A stop at the token limit, a refusal, a content filter or an output that fails its schema is an expected failure of its own type, and only an output that fails its schema is asked again, at most the number of times the project sets.

| Why |
|---|
| a cut or refused output often parses and reads like an answer, and the program then acts on half of one. |

## Addresses

### output-address-followed-only-from-an-allowlist → outside-address-followed-only-from-an-allowlist · MUST

An address in a language model's output is followed only from an allowlist. A link, an image or any other address there is made live, loaded or fetched only when its host is on the program's allowlist; any other is shown as text or dropped.

| Why |
|---|
| text the language model read can tell it to write an image whose address carries the person's data, and the renderer sends that data when it loads the image. |

## Disclosure

### person-told-they-talk-with-a-model · MUST

A person is told when they talk with a language model. They are told before an exchange of messages or speech with one begins, unless the context makes it plain, wherever the law of the region the product serves makes it binding, as the EU's AI Act does.

| Why |
|---|
| a person weighs an answer by who gave it, and the EU's AI Act fines a product that lets them take a language model for a person. |

### generated-content-marked-as-generated · MUST

Generated content carries a machine-readable mark that it was generated. This covers the text, audio, images and video the program generates, where the law that binds the product asks it, such as Article 50 of the EU AI Act.

| Why |
|---|
| a notice on the screen stays behind when the file is copied, so the content passes for a person's work wherever it goes next. |
