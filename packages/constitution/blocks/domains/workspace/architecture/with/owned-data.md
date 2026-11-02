# Owned data

> Governs what programs that own their data share.

## General

### programs-owning-their-data-share-only-contracts · MUST

Programs that own their data apart share no business rule. They are services deployed on their own, each deciding on the data it owns, and what they share — a unit of `packages/` or a group's `shared/` package — holds only contracts and wire shapes.

| Why |
|---|
| a business rule two services share ties their releases together, and a change to it must reach the data each of them owns at once, so they become one program deployed in pieces with its data split between them. |
