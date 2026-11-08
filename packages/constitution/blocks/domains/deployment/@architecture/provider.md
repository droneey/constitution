# Provider

> Governs the configuration provider: where it sits, what it implements, the one unit that reads the configuration inputs, and the one that imports it.

## Vocabulary

The program's **configuration inputs** are the settings its host hands it under the names its configuration declaration declares, in its platform's form: a process's environment variables of those names, or a file of settings its host serves beside the program's code. An environment variable the declaration does not name is none.

The **configuration provider** is the unit that reads them and parses them by the program's configuration declaration, as the settings chapter defines it, into the values the root hands on.

## General

### configuration-provider-sits-at-the-edge → effects-held-only-by-the-edge · MUST

The configuration provider sits at the edge, in the top-level `infrastructure/`.

| Why |
|---|
| a provider placed inside a feature is reached by the units beside it, so the host's settings are read deep inside the program, where no spec drives that code without setting them. |

### configuration-provider-implements-no-port · SHOULD

The configuration provider implements no port.

| Why |
|---|
| a provider behind a port is handed into the code it configures, which then reads the host's settings through it instead of taking the values the root hands it, so no spec drives that code without setting them. |

### configuration-inputs-read-only-by-the-configuration-provider · MUST

Only the configuration provider reads the configuration inputs, and an entry file passes them on unread. Exempt: a spec, which may read them to drive the program.

| Why |
|---|
| a unit that reads environment variables or a settings file itself depends on its host through a read no signature shows, so a spec cannot drive it without setting them. |

### configuration-provider-imported-only-by-the-root · SHOULD

The configuration provider is imported only by the composition root, which hands each unit the values it needs. Exempt: specs.

| Why |
|---|
| a unit that takes its settings from the provider itself reaches the configuration inputs through it, so a spec cannot drive it without setting them. |
