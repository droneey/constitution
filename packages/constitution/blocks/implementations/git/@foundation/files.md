# Files

> Governs which files git keeps outside its history.

## General

### large-files-kept-in-lfs → large-files-outside-history · SHOULD

Every large binary file is tracked by Git LFS, so the repository history keeps only its pointer. Exempt: a file kept out of the repository altogether.

#### Why

A large file committed as itself is downloaded by every clone for ever, while Git LFS fetches only the versions a checkout needs.

#### Examples

```bash title="Avoid"
git add assets/catalogue-video.mp4
```

```bash title="Prefer"
git lfs track "assets/*.mp4"
git add .gitattributes assets/catalogue-video.mp4
```
