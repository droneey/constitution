# React DOM

### document-metadata-rendered-by-its-owner → document-metadata-owned-by-screen · SHOULD

Unless another active block claims the document's head, `<title>`, `<meta>` and `<link>` are rendered as elements by the screen or component that owns them, and React hoists them into the head.

| Why | Tags |
|---|---|
| React hoists these elements from wherever they are rendered, so each is declared beside what it describes. | [ux] |

### third-party-script-rendered-as-element → third-party-script-declared-where-it-is-used · SHOULD

A third-party script a component uses is rendered as `<script async src>` by that component; one an adapter loads behind its port is inserted by that adapter alone.

| Why | Tags |
|---|---|
| React dedupes and orders rendered scripts, and the script loads with the component that needs it; a service behind a port stays unknown to every component, so its adapter loads its script. | [performance] |
