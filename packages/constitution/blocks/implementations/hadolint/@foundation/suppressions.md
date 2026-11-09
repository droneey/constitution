# Suppressions

> Governs how a finding of hadolint is suppressed, and where the reason stands.

## General

### hadolint-ignore-on-the-line-above → suppression-silences-one-finding · MUST

Every hadolint suppression is a `# hadolint ignore=<code>` comment on the line above the one instruction it silences.

#### Why

Hadolint reads an inline ignore only on the line above an instruction, where a code it names is silenced for that instruction alone.

#### Examples

```dockerfile title="Avoid"
# Why: the build layer is cached apart from the install layer
# hadolint ignore=DL3059
FROM node:22.11.0-bookworm-slim

WORKDIR /app
RUN npm ci --omit=dev
RUN npm run build
```

```dockerfile title="Prefer"
FROM node:22.11.0-bookworm-slim

WORKDIR /app
RUN npm ci --omit=dev
# Why: the build layer is cached apart from the install layer
# hadolint ignore=DL3059
RUN npm run build
```

### hadolint-reason-in-a-comment-of-its-own → suppression-states-its-reason · MUST

Every hadolint suppression's reason stands in a comment of its own, after a second `#` or on the line above the suppression. It is never written after the code inside the suppression.

#### Why

A suppression with words after its code silences nothing, so the finding stays reported, and a reason written there is dropped to make the suppression work.

#### Examples

```dockerfile title="Avoid"
# hadolint ignore=DL3059 the build layer is cached apart from the install
RUN npm run build
```

```dockerfile title="Prefer"
# Why: the build layer is cached apart from the install layer
# hadolint ignore=DL3059
RUN npm run build
```
