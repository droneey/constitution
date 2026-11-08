# Releases

> Governs the release tags that mark numbered releases.

## Vocabulary

A **numbered release** is a version of what the project ships that carries a number; a deploy of the main line that carries no version number of its own is none.

A **version-control tag** names one version-control commit by a name of its own.

A **release tag** is the version-control tag that marks a numbered release.

The **release automation** is the tool that numbers and tags each numbered release, recording its version in a **release commit**, a version-control commit of its own.

## Tags

### release-marked-by-its-version-tag · MUST

Every numbered release is marked by a release tag that names its version, on the version-control commit it was built from.

#### Why

A numbered release with no release tag on its version-control commit cannot be found in the repository history, so nobody can rebuild it, compare it with the next or bisect a regression back to it.

#### Examples

```text title="Avoid"
main:  a1  b2  c3 (chore: Release 2.4.0)

tags:  none
```

```text title="Prefer"
main:  a1  b2  c3 (chore: Release 2.4.0)

tags:  v2.4.0 -> c3
```

### release-tag-never-moved · MUST

No release tag is moved, deleted or reused.

#### Why

A version must always name the same code, and a release tag that can be moved or made again lets whoever controls it swap the code under everyone who uses that version.

#### Examples

```text title="Avoid"
v2.4.0 -> c3
found a bug in 2.4.0, fixed in d4
v2.4.0 -> d4  (tag moved)
```

```text title="Prefer"
v2.4.0 -> c3
found a bug in 2.4.0, fixed in d4
v2.4.1 -> d4
```

### release-tag-signed · MUST

Every release tag is signed by the identity that made the numbered release.

#### Why

An unsigned release tag proves nothing of who released the code, so an attacker who can push a release tag passes off their code as a numbered release.

#### Examples

```text title="Avoid"
tag v2.4.0 -> c3
  tagger: release-bot
  signature: none
```

```text title="Prefer"
tag v2.4.0 -> c3
  tagger: release-bot
  signature: good, key of release-bot
```
