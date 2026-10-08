# Language model with privacy

> Governs the personal data a model's provider receives, and its erasure.

## Providers

### provider-receives-personal-data-only-as-a-processor → personal-data-reaches-only-a-listed-recipient · MUST
Personal data reaches a model's provider only when the inventory lists that provider as a processor, under terms that keep the data out of training and hold it no longer than the call needs, with the request's own storage turned off.

| Why | Tags |
|---|---|
| a prompt hands its data to another company, and terms that let it train on or keep the data make it the provider's. | [data, security] |

## Erasure

### erasure-reaches-indexes-conversations-and-caches → personal-data-erased-on-request · MUST
Erasing a person's data erases it from every index of embeddings, every stored conversation and memory, and every cache of answers that holds it.

| Why | Tags |
|---|---|
| an embedding or a cached answer still yields the data it was made from, and is a copy the person was told was gone. | [data] |
