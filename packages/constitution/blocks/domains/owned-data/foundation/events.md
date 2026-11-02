# Events

> Governs how an event a change yields reaches what reacts to it.

## General

### events-reach-reactions-after-their-change-commits → write-lands-whole · MUST

An event reaches what reacts to it at least once, and only after its change commits. The event is saved in the transaction that saves its change and handed on from there until its reaction has run, and is never promised to arrive only once, so each reaction to it is an idempotent receiver. Nothing that reacts to it runs inside the transaction that saves the change.

| Why |
|---|
| an event saved apart from its change, or handed on from memory after the commit, is lost or announces what never happened when the program stops between the two, a reaction run inside the saving transaction acts on a change that may still roll back, and a reaction that is not idempotent repeats its effect when the event is handed on twice — the transactional outbox and the idempotent receiver. |
