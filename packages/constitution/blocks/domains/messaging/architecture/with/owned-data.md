# Owned data

> Governs who hands the events a feature saves with their change on to the broker.

## General

### outbox-relayed-by-a-worker-the-root-starts → events-reach-reactions-after-their-change-commits · MUST

The events a feature saves with their change reach the broker only through its outbox's relay, an edge worker the composition root starts. The relay reads them from the feature's store once their save commits and hands each to the feature's broker port; no use case or binding unit hands such an event to that port, and a use case calls it only for a command message no save yields.

| Why |
|---|
| an event a use case hands to the broker beside its save is lost, or announces what never happened, when the program stops between the two, and a relay written as a binding unit reaches the broker port past every use case — the transactional outbox. |
