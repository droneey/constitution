```bash title="Avoid"
# README: install the tools first
npm install --global typescript
tsc --noEmit
```

```json title="Prefer"
{
  "devDependencies": {
    "typescript": "5.6.3"
  },
  "scripts": {
    "types": "tsc --noEmit"
  }
}
```
