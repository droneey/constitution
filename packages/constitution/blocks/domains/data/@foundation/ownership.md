# Ownership

> Governs what programs that own their data apart may share.

## General

### programs-owning-their-data-share-no-business-rule → fact-has-one-source · MUST

No two programs that own their data apart share a rule of the business. Neither a library both import nor any other code both run holds one for them.

| Why |
|---|
| a business rule two services share ties their releases together, and a change to it must reach the data each of them owns at once, so they become one program deployed in pieces with its data split between them. |
