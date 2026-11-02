```text title="Avoid"
pipeline secret DEPLOY_KEY
  created  2024-03-02
  expires  never
```

```text title="Prefer"
pipeline token, asked of the
cloud by the pipeline's identity
  issued   at each run
  expires  after 15 minutes
```
