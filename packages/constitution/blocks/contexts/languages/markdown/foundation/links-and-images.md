# Links and images

> Governs links and images: their targets, their text and their alt text.

## General

### repository-link-is-a-path · SHOULD

A link to a file of the same repository is a path, relative to the document or to the repository's root, never a full URL on the forge.

| Why |
|---|
| a path works on every branch, fork, clone and mirror, while a full URL points at one branch on one host and goes stale with it. |

### repository-link-resolves · MUST

A link to a file of the repository leads to a file that exists, and its fragment to a heading that exists in that file.

| Why |
|---|
| a broken link sends the reader nowhere just when they need the page, and a moved file or a renamed heading breaks links far from the change. |

### link-text-names-its-target · SHOULD

A link's text says where it leads, never `here`, `this`, `link` or the bare address.

| Why |
|---|
| readers scan links, and a screen reader lists them out of their sentence, where `here` tells nothing. |

### image-has-alt-text · MUST

An image carries alt text that says what it shows, or empty alt text where it only decorates.

| Why |
|---|
| a reader who cannot see the image, or whose renderer cannot show it, reads the alt text in its place. |
