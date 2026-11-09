# Observability

> Governs the objective a scheduled job's runs are held to.

## Measures

### stalled-scheduled-run-alerted → alert-fires-on-what-users-feel · SHOULD

Every stall of a scheduled job counts against the objective its alerts watch. Its runs have an objective, against which a tick whose run fails or never comes counts as failed. Exempt: a tick skipped because its last run still works, as the job's declaration of its overlapping ticks allows.

#### Why

A job that stops running fails in silence, and users feel it only as an effect that comes late or never, which is what the objective measures.

#### Examples

```text title="Avoid"
job send-overdue-reminders
  alert      on a run that fails
```

```text title="Prefer"
job send-overdue-reminders
  objective  99% of hourly ticks succeed
             within 15 minutes, over 30 days
  counted    a tick whose run fails or
  as failed  never comes
  alert      on the objective's burn rate
```
