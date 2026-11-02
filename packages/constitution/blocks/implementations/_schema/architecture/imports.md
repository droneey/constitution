# Imports

> Governs where a schema library is imported.

## General

### schema-library-home-is-where-input-is-parsed → layer-imports-dependencies-by-its-role · MUST

A schema library is imported only where the program parses outside input. Outside the edge, its homes are the presentation of a feature, of a composition module or of the program — where a request's or a form's input is checked — and the top-level `shared/`, where code parses; no other folder imports it.

| Why |
|---|
| a schema inside the domain ties the business types to a parsing library, and runs its checks again on data the edge has already parsed — the dependency rule. |
