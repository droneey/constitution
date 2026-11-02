```text title="Avoid"
14:02  API key pushed in a commit
14:10  commit reverted; done
```

```text title="Prefer"
14:02  API key pushed in a commit
14:05  key revoked, a new one
       issued
14:20  the key's access log for
       14:02–14:05 checked: no
       caller but ours
```
