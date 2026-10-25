# Edge

> Governs where zod is imported.

## General

### zod-home-is-the-edge-and-shared-parsing → layer-imports-dependencies-by-its-role · MUST

zod's home is the edge, the request and response schemas of the delivery units in the `app/` of a feature or a module of composition, and `shared/`, where code parses; no other folder imports it.

| Why |
|---|
| a schema inside the domain ties the business types to a parsing library, and runs its validation again on data the edge has already checked. |
