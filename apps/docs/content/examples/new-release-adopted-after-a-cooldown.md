```text title="Avoid"
Mon 09:00  pretty-dates 3.2.0 out
Mon 09:20  update merged
Mon 15:00  3.2.0 pulled: hijacked
```

```text title="Prefer"
Mon 09:00  pretty-dates 3.2.0 out
Mon 15:00  3.2.0 pulled: hijacked
Wed 10:00  3.2.1 out
Sat 10:00  3.2.1 three days old:
           update merged
```
