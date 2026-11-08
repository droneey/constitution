```bash title="Avoid"
curl -fsSL -o scan \
  "$RELEASES/latest/scan"
chmod +x scan
```

```bash title="Prefer"
curl -fsSL -o scan \
  "$RELEASES/v2.4.1/scan"
# Why: scan.sha256 is kept in the repository, never fetched beside scan
sha256sum --check scan.sha256
chmod +x scan
```
