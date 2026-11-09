# Imports

> Governs where the `yaml` package is imported.

## General

### yaml-package-home-is-where-yaml-is-read-or-written → layer-imports-dependencies-by-its-role · MUST

The `yaml` package is imported only where YAML is read or written. Its homes are the adapters that read or write YAML and the generic library that wraps the package; no other folder imports it.

#### Why

A parser in the domain ties the business rules to a file format, and its untyped result travels inward unchecked — the dependency rule.

#### Examples

```ts title="Avoid"
// src/features/workflows/domain/workflow/entities/workflow.aggregate.ts
import { stringify } from 'yaml';

export const toYaml = (workflow: Workflow): string => stringify(workflow, { lineWidth: 0 });
```

```ts title="Prefer"
// src/features/workflows/infrastructure/files/workflow-store.adapter.ts
import { stringify } from 'yaml';

export const createWorkflowStore = (files: Files): WorkflowStorePort => ({
  save: (workflow, context) =>
    files.write(workflow.path, stringify(toWorkflowDocument(workflow), { lineWidth: 0 }), context),
});
```
