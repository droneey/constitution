# Tags

> Governs how a release tag is made.

## General

### release-tag-made-with-git-tag-s → release-tag-signed · MUST

Every release tag is made with `git tag -s`, an annotated tag signed by its tagger's key, never a lightweight one.

| Why |
|---|
| a lightweight tag carries no signature, no tagger and no date, so nothing in the repository history proves who released the code or when. |
