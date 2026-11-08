# Deployment

> Governs the model the configuration provider is.

## General

### configuration-provider-is-one-base-settings → configuration-inputs-read-only-by-the-configuration-provider · MUST

The configuration provider is one `BaseSettings` of pydantic-settings, whose fields and validators read and parse every configuration input.

| Why |
|---|
| a second settings model, or a variable read past the one, parses the configuration inputs in two places, so a missing or invalid setting is found one at a time, wherever each is read, instead of all at once where the provider is built. |
