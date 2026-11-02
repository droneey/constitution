# Events

> Governs how an aggregate's repository saves the events its transitions yielded.

## General

### aggregate-saved-with-its-events → repository-stores-whole-aggregates · MUST

An aggregate's events are saved by its repository alone, with the aggregate. The events its transitions yielded reach the store only through the save of the aggregate that yielded them, never through other code.

| Why |
|---|
| events saved by other code — a use case, a hook, a second port — can be saved without the aggregate's change or with a change no transition yielded them for, and the outbox then announces a change the store does not hold — the transactional outbox. |
