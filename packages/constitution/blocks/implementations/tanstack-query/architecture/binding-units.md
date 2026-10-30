# Binding units

> Governs where the query library is imported, and what it decides.

## General

### query-library-home-is-the-binding-units → layer-imports-dependencies-by-its-role · MUST

The query library's home is the binding units in the presentation of features and of composition modules, and `root/`, which builds the client; no other folder imports it — no component, adapter or code of `libs/`.

| Why |
|---|
| caching belongs to the binding units: a component that queries can no longer be shown with plain data, an adapter that caches holds a second cache, and a library that caches takes the application's data into code every program shares. |

### query-library-decides-when-never-what → use-case-leaves-decisions-to-the-model · MUST

The query library decides when and how often an operation's use case runs — its cache, retries, pauses, deduplication and persistence — and never what the use case decides; a mutation's callbacks only predict its outcome and undo the prediction, through the model's own functions. Where the business defines what happens without a connection, the use case decides it and the library does not pause it.

| Why |
|---|
| a rule hidden in the library's configuration or callbacks never reaches the model, and a pause the library takes before the use case runs silently skips the offline path the use case holds. |
