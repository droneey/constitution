# Jobs

> Governs work run on a schedule: once per tick, keyed by its tick, in a stated zone.

## Ticks

### scheduled-job-runs-once-per-tick · MUST

A scheduled job runs once per tick, however many instances of the program run. Its tick is claimed once, in a store the instances share or by a scheduler that runs one copy, never by a timer or a lock local to each instance.

| Why |
|---|
| every instance's timer fires on the same tick, so a second replica doubles every run, and a lock in a file or a memory guards only its own host. |

### scheduled-run-keyed-by-its-tick → operation-idempotent-by-design · MUST

A run of a scheduled job is keyed by its tick and idempotent. A tick run twice — a scheduler's retry, a claim whose lease expired — then changes nothing the first run did not.

| Why |
|---|
| schedulers promise about one run per tick, sometimes two and sometimes none, so a run not keyed by its tick repeats its effect each time a tick runs twice. |

### scheduled-job-declares-missed-and-overlapping-ticks · SHOULD

A scheduled job declares what happens to a missed tick and to an overlapping one. A tick missed while nothing ran is run once late within a deadline or skipped, and a tick that comes while the job's last run still works is skipped, waits or replaces that run, as the job declares.

| Why |
|---|
| the scheduler's default decides otherwise, and a backlog of missed ticks run at once after an outage, or runs piled on a slow one, overload what they touch. |

## Time

### schedule-names-its-time-zone → instant-is-an-exact-time · MUST

A schedule names its time zone. One set in local time states what it does in the hour a change of clock skips or repeats.

| Why |
|---|
| a schedule read in the machine's zone moves when the host does, and a daily job set in local time runs twice or not at all on the night the clocks change. |
