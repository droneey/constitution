```text title="Avoid"
the developer's laptop
  agent, permission checks off
  reads  ~/.ssh, ~/.aws, .env
  reaches any host
```

```text title="Prefer"
a container made for the run
  agent, permission checks off
  holds  the repository, no
         secret
  reaches the package registry
          and the model's API
```
