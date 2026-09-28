# Browser with user interface

## url-holds-shareable-view-state · MUST
View state a link or a reload must reproduce — filters, sort, page, selection, the open tab — lives in the URL, and nothing else does. A screen writes the one parameter it changes and keeps the others.
**Why:** a view in the URL can be shared, bookmarked and restored with the back button; a view kept elsewhere is lost on reload.
**Check:** review
**Tags:** data, ux
**Implements:** `view-state-homes`

## document-metadata-owned-by-screen · SHOULD
Title, description and links of the document are declared by the screen or component that owns them; a third-party script is declared where it is used.
**Why:** metadata declared beside what it describes changes with it, and no central file must know every screen.
**Check:** review
