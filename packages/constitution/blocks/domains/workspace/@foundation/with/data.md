# Data

> Governs what programs that own their data share.

## General

### programs-owning-their-data-share-only-contracts → programs-owning-their-data-share-no-business-rule · MUST

Every package that programs owning their data apart share holds only contracts, the shapes they exchange and the cases that prove them.

#### Why

A package both programs import is the first place a helper of the business lands, as a check of a date or of an amount, so a package that holds anything beyond what they exchange already carries the rule they may not share.

#### Examples

```text title="Avoid"
packages/billing-contracts/
├── invoice-issued.schema.json
└── is-overdue.ts       a rule of billing's business
```

```text title="Prefer"
packages/billing-contracts/
├── invoice-issued.schema.json
└── cases/
    └── invoice-issued.json
```
