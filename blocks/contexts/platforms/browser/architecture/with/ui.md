# Browser with user interface

## url-holds-shareable-view-state → view-state-homes
View state a link or a reload must reproduce — filters, sort, page, selection, the open tab — lives in the URL, and nothing else does. A screen writes the one parameter it changes and keeps the others.

| Why | Check | Tags |
|---|---|---|
| a view in the URL can be shared, bookmarked and restored with the back button; a view kept elsewhere is lost on reload. | review | [ux] |

## document-metadata-owned-by-screen · SHOULD
Title, description and links of the document are declared by the screen or component that owns them; a third-party script is declared where it is used.

| Why | Check | Tags |
|---|---|---|
| metadata declared beside what it describes changes with it, and no central file must know every screen. | review | [] |
