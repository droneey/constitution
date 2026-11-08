# Events

> Governs how an event its edge worker holds for its operator is kept in the event outbox, where the event outbox's relay hands the events to the reactions itself, what it holds back, and how the operator's command reaches it.

## Vocabulary

An event outbox's relay is a **direct relay** when it hands the program's events to its reactions itself, with no broker between.

## Held events

### held-event-kept-in-the-outbox → spent-step-held-for-its-operator · MUST

With a direct relay, every event held for its operator stays in its event outbox entry. The entry is marked held for the reaction it is held for, and the relay hands it to that reaction no more until the operator's command does.

| Why |
|---|
| a held event moved out of the event outbox, or kept only in the edge worker's memory or log, leaves no record the operator's command can hand on again or give up, and an entry with no mark is handed on again at the next pass of the relay. |

### held-event-records-its-failures · SHOULD

With a direct relay, every event outbox entry held for its operator records why it is held. It keeps the cause of its reaction's last failure and its count of attempts.

| Why |
|---|
| an entry held with no cause cannot be diagnosed, and one with no count of attempts leaves the operator unable to tell a failure that never cleared from one that came late. |

### held-entry-holds-back-only-its-aggregate → aggregates-events-reach-each-reaction-in-order · MUST

With a direct relay, every held event outbox entry holds back only its aggregate's later entries for its reaction. It never holds back those of another aggregate or another reaction.

| Why |
|---|
| a relay that stops at its first held entry stalls every event of the program, for every reaction, until the operator acts, though none of them depends on the one that failed. |

### held-event-reached-through-a-port-over-the-outbox → spent-step-held-for-its-operator · MUST

With a direct relay, every operator's command reaches a held event's entry only through a port over the event outbox. It hands the event on again or gives it up there, and nothing releases the entry by an edit of the store.

| Why |
|---|
| a held event released by an edit of the store bypasses the command that also gives up its saga step, so the step and its event part ways, and a slip in the edit hands on or drops the wrong entry. |
