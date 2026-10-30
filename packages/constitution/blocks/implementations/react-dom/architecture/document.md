# Document

> Governs who renders the document's metadata and a third-party script.

## General

### document-metadata-rendered-by-its-owner → document-metadata-owned-by-screen · SHOULD

`<title>`, `<meta>` and `<link>` are rendered as elements by the unit that owns them, beside the screen or component they describe, and React hoists them into the head.

| Why |
|---|
| React hoists these elements from wherever they are rendered, so each is declared beside what it describes. |

### third-party-script-rendered-as-element → third-party-script-declared-where-it-is-used · SHOULD

A third-party script a component uses is rendered as `<script async src>` by that component; one a service behind a port needs is appended once to the body by the adapter that implements the port, and no other code inserts a script.

| Why |
|---|
| React dedupes and orders rendered scripts, and the script loads with the component that needs it; a service behind a port stays unknown to every component, so its adapter loads its script, and a script inserted elsewhere runs twice or too early. |
