# People

> Governs the personal data an event outbox entry or a saga step holds while it waits for its operator.

## Retention

### held-entry-or-step-settled-before-its-retention-ends → personal-data-kept-no-longer-than-its-retention · MUST

Every held event outbox entry or saga step is settled by its operator's command before its personal data's retention period ends. An entry is settled when it is handed on again or given up, and a step when it is revived or given up.

| Why |
|---|
| a held entry or step leaves the store only by its operator's command, so one its operator never reaches keeps the person's data past the date the person was told it was gone. |
