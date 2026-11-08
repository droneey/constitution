# Outputs

> Governs what a language model returns: how it is parsed, when it is complete, which addresses in it are reached, and what a person is told of it.

## Vocabulary

An **unfinished model output** is an output, or the whole output of a model run, that stopped at its limit of model tokens or at a bound of its run, was refused, filtered or cancelled, or failed its schema.

## Parsing

### model-output-parsed-by-the-programs-schema → outside-value-untyped-until-parsed · MUST

Every output the program acts on is parsed by the program's own closed schema, whatever structure its provider guarantees. Such an output is a choice, a record or a model tool's arguments.

| Why |
|---|
| a provider's structured output skips the constraints it cannot enforce and breaks on a refusal or a cut, so an output trusted on the provider's word passes on data no schema of the program checked — parse, don't validate. |

### failed-output-never-repaired-by-guessing · MUST

No output that fails its schema is repaired by guessing what the language model meant.

| Why |
|---|
| a repair that guesses passes on data the language model never gave, and the program acts on it as if it had. |

## Endings

### output-used-only-when-finished · MUST

Every output is acted on, stored or handed to another step only once the language model ended it of its own accord. Exempt: the text of an unfinished model output, stored with the expected failure it ended in and handed to the model only as the history of its conversation, such as a stopped answer.

| Why |
|---|
| a cut or refused output often parses and reads like an answer, and the program then acts on half of one. |

### streamed-output-marked-unfinished · MUST

Every output shown before the language model ended it of its own accord is marked as not complete. One still streaming is marked as streaming, and one that stopped, an unfinished model output or one a failed call cut off, as unfinished.

| Why |
|---|
| a person who reads an answer still streaming, or one that stopped half way, takes the half for the whole answer unless it says it is not complete. |

### unfinished-output-fails-as-expected → failure-is-expected-or-defect · MUST

Every unfinished model output ends as an expected failure of its own type, never as a complete answer.

| Why |
|---|
| a caller handed half an answer as a whole one acts on it, while one handed the failure for what it is can ask again, shorten or tell its person. |

### only-schema-failure-asked-again → failure-retried-only-when-transient · MUST

Of unfinished model outputs, only one that failed its schema is asked for again, at most as often as the project sets.

| Why |
|---|
| a refusal, a filter or a stop at a bound comes back the same on every attempt, so asking again pays for the same failure, while a sample that missed its schema may well pass on the next. |

## Addresses

### output-address-reached-only-from-an-allowlist → outside-address-reached-only-from-an-allowlist · MUST

Every address in a language model's output is made live, loaded or fetched only from the program's allowlist of hosts. A public host is no exception, and every other address is shown as text or dropped.

| Why |
|---|
| text the language model read can tell it to write an image whose address, on a public host its writer runs, carries the person's data, and the renderer sends that data when it loads the image. |

## Disclosure

### person-told-they-talk-with-a-model · MUST

Wherever the law that binds the product so asks, every person is told before an exchange that a language model answers them. Exempt: an exchange whose context makes it plain.

| Why |
|---|
| a person weighs an answer by who gave it, and a law such as the EU's AI Act fines a product that lets them take a language model for a person. |

### generated-content-marked-as-generated · MUST

Wherever the law that binds the product asks it, all content its language models generate carries a machine-readable mark that says so. Such content is text, audio, images and video.

| Why |
|---|
| a notice on the screen stays behind when the file is copied, so the content passes for a person's work wherever it goes next, and Article 50 of the EU AI Act requires the mark from 2 August 2026, or from 2 December 2026 for a system on the market before then. |
