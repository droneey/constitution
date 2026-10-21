# Findings

> Governs what a scan prints of what it finds.

## General

### scan-redacted → secret-and-personal-data-kept-out-of-output · MUST

Every scan passes `--redact`.

| Why | Tags |
|---|---|
| a finding a scan prints stays in the terminal and in any log that captures it, the CI's included. | [] |
