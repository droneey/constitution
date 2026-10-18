```pseudo
type Payment = { paidAt: Instant }       # 2026-10-18T09:30:00Z
type Invoice = { dueOn: CalendarDate }   # 2026-11-01
type Meeting = {
  startsAt: WallTime,                    # 2027-03-30T09:00
  zone: TimeZone                         # "Europe/Warsaw"
}

# the instant is made only when it is used, by that zone's rules
let reminderAt = instantOf(meeting.startsAt, meeting.zone)
```
