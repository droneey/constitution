# React DOM

## no-dangerously-set-inner-html → no-raw-html-injection
`dangerouslySetInnerHTML` is never set.

| Why | Check | Tags |
|---|---|---|
| it writes a string into the DOM as markup, past React's escaping. | tool/lint | [] |

## document-metadata-rendered-by-its-owner → document-metadata-owned-by-screen
Unless another active block claims the document's head, `<title>`, `<meta>` and `<link>` are rendered as elements by the screen or component that owns them, and React hoists them into the head.

| Why | Check | Tags |
|---|---|---|
| React hoists these elements from wherever they are rendered, so each is declared beside what it describes. | review | [ux] |

## third-party-script-rendered-as-element → document-metadata-owned-by-screen
A third-party script is rendered as `<script async src>` by the component that uses it; no script tag is inserted by hand.

| Why | Check | Tags |
|---|---|---|
| React dedupes and orders rendered scripts; a hand-inserted one runs twice or too early. | review | [performance] |
