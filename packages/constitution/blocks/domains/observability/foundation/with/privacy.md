# Privacy

> Governs the personal data a signal's mask removes.

## Masking

### signal-mask-lists-personal-fields → personal-data-kept-out-of-output · MUST

A signal's mask also lists the personal fields the project keeps. Their names, such as `email` and `phone`, are among those the mask looks for, compared as whole words like the secret ones.

| Why |
|---|
| a person's data passed as a field by mistake otherwise reaches every log record, span and exemplar the mask covers for secrets, and leaves with them for whoever reads the signals. |
