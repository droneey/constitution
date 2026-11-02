# Settings

> Governs who builds the settings model.

## General

### settings-model-built-by-the-root → root-alone-reads-the-environment · MUST

One `BaseSettings` of pydantic-settings is the root's configuration provider, and only the root builds it. The settings model and its validators read and parse the environment where the root builds it, once at boot; the rest of the program receives the values it needs, never the settings model.

| Why |
|---|
| a variable read where it is used fails in the middle of a request, one problem at a time, and a module that reads the environment depends on it through a read no signature shows; validators kept in the root would decide what a value may be where no spec proves it, while the provider's specs do. |
