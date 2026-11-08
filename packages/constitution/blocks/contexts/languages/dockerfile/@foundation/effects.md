# Effects

> Governs the effects of an image's process: how the program its `CMD` and `ENTRYPOINT` start takes the stop signal.

## Stopping

### start-instructions-in-exec-form → program-stops-cleanly · MUST

Every `CMD` and `ENTRYPOINT` is written in the exec form.

#### Why

In the shell form a shell is the first process and swallows the stop signal, so every stop waits for the kill timeout.

#### Examples

```dockerfile title="Avoid"
ENTRYPOINT node dist/orders-server.js
```

```dockerfile title="Prefer"
ENTRYPOINT ["node", "dist/orders-server.js"]
```
