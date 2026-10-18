```pseudo title="Avoid"
let d = 7
if u.flg then
  sndRmd(u, d)
```

```pseudo title="Prefer"
let trialDays = 7
if user.isOnTrial then
  sendTrialReminder(user, trialDays)
```
