```bash title="Avoid"
deploy --token "$DEPLOY_TOKEN"
```

```bash title="Prefer"
printf '%s' "$DEPLOY_TOKEN" \
  | deploy --token-stdin
```
