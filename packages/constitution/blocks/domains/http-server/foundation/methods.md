# Methods

> Governs what a method may change.

## General

### safe-method-changes-nothing · MUST

A request by a safe method of HTTP — `GET`, `HEAD`, `OPTIONS` — changes no state.

| Why |
|---|
| a link, a prefetch, a crawler or a cache sends such a request without anyone meaning its effect, and a forged page sends it with the user's cookies. |
