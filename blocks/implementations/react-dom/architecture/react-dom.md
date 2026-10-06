# React DOM

### document-metadata-rendered-by-its-owner → document-metadata-owned-by-screen
Unless another active block claims the document's head, `<title>`, `<meta>` and `<link>` are rendered as elements by the screen or component that owns them, and React hoists them into the head.

| Why | Tags |
|---|---|
| React hoists these elements from wherever they are rendered, so each is declared beside what it describes. | [ux] |

### third-party-script-rendered-as-element → document-metadata-owned-by-screen
A third-party script is rendered as `<script async src>` by the component that uses it.

| Why | Tags |
|---|---|
| React dedupes and orders rendered scripts, and the script loads with the component that needs it. | [performance] |
