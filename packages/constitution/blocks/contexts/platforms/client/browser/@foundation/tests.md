# Tests

> Governs the specs of what a browser program's files are served with.

## General

### served-headers-proven-by-a-test · MUST

Every caching and security header a browser rule asks of a served file is read by a test from what is sent.

| Why |
|---|
| a header nobody reads goes missing unseen, and a missing security header leaves the browser's defence off. |
