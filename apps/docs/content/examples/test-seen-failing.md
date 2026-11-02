```text title="Avoid"
1. fix the rounding of total
2. add "should round half to
   even"
   PASS
```

```text title="Prefer"
1. add "should round half to
   even"
   FAIL  expected 2.34, got 2.35
2. fix the rounding of total
   PASS
```
