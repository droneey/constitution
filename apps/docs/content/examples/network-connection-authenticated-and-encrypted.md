```pseudo title="Avoid"
# root/run
let database = createPostgresClient({
  url: config.ordersDatabaseUrl,
  tls: { verifyPeer: false },
})

stop.release(database)
```

```pseudo title="Prefer"
# root/run
let database = createPostgresClient({
  url: config.ordersDatabaseUrl,
  tls: {
    verifyPeer: true,
    authority: config.databaseAuthority,
  },
})

stop.release(database)
```
