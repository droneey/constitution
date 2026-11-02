# Links and images

> Governs links and images: their targets, their text and their alt text.

## General

### repository-link-is-a-path · SHOULD

A link to a file of the same repository is a path, never a full URL on the forge. The path is relative to the document or to the repository's root.

| Why |
|---|
| a path works on every branch, fork, clone and mirror, while a full URL points at one branch on one host and goes stale with it. |

### repository-link-resolves · MUST

A link to a file of the repository leads to a file that exists, and its fragment to a heading that exists in that file.

| Why |
|---|
| a broken link sends the reader nowhere just when they need the page, and a moved file or a renamed heading breaks links far from the change. |

### link-text-names-its-target · SHOULD

A link's text says where it leads. It is never `here`, `this`, `link` or the bare address.

| Why |
|---|
| readers scan links, and a screen reader lists them out of their sentence, where `here` tells nothing. |

### image-has-alt-text · MUST

An image carries alt text that says what it shows, or empty alt text where it only decorates.

| Why |
|---|
| an image without alt text is lost to a reader who cannot see it or whose renderer cannot show it, and a decorative one without empty alt text is read aloud by its file name — WCAG 2.2, Non-text Content. |
