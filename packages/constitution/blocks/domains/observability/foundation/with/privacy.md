# Privacy

> Governs the personal data a signal's mask removes.

## Masking

### signal-mask-lists-personal-fields → personal-data-kept-out-of-output · MUST

The names a signal's mask looks for also hold those of the personal fields the project keeps, such as `email` and `phone`, compared as whole words like the secret ones: `user_email` is masked.

| Why |
|---|
| a person's data passed as a field by mistake is then masked whichever code wrote it, in every log record, span and exemplar the mask already covers. |
