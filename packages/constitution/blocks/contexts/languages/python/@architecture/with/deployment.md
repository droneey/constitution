# Deployment

> Governs how a Python program reads its configuration inputs from its environment variables.

## Configuration inputs

### configuration-input-read-from-os-environ-only-by-the-provider → configuration-inputs-read-only-by-the-configuration-provider · MUST

Only the configuration provider reads a configuration input from `os.environ`, `os.environb` or `os.getenv`. Exempt: a spec, which may read the configuration inputs to drive the program.

| Why |
|---|
| a configuration input read from the process anywhere else, an entry file included, is a dependency on the host that no signature shows and no spec can hand in. |
