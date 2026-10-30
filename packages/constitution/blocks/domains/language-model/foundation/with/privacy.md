# Privacy

> Governs the personal data in the text a model reads and writes.

## General

### prompt-text-kept-out-of-telemetry → personal-data-kept-out-of-output · MUST

The text of prompts and outputs reaches logs, traces and metrics only through a setting that is off by default, and is masked of personal data when the setting is on.

| Why |
|---|
| prompts carry what people typed and the documents they hold, and telemetry keeps that text longer and shows it to more people. |
