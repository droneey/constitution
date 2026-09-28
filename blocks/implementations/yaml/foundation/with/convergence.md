# yaml with convergence

> The document a convergence program reads, written in YAML.

## document-header-names-its-schema · SHOULD
The document's first line is `# yaml-language-server: $schema=<published schema URL>`.
**Why:** editors then check and complete the document against the program's own schema.
**Check:** review
**Tags:** ux
**Implements:** `init-writes-document-from-template`
