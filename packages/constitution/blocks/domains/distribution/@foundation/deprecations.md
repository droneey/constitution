# Deprecations

> Governs what a deprecated entry of a distributed package says.

## General

### deprecated-entry-names-its-replacement → deprecation-names-its-replacement · SHOULD

Every deprecated entry of a distributed package names its replacement.

| Why |
|---|
| a deprecation without a replacement leaves the consumer stuck between an entry that is going and nothing to move to. |

### deprecated-entry-names-its-removal-version → retired-code-marked-deprecated · MUST

Every deprecated entry of a distributed package names the version that removes it.

| Why |
|---|
| a deprecation without a removal version never ends, so consumers never plan the move and the entry is kept for ever or removed by surprise. |
