# Effects

> Governs the effects of an image's process: how its command takes the stop signal.

## Stopping

### commands-in-exec-form → program-stops-cleanly · MUST

`CMD` and `ENTRYPOINT` use the JSON exec form, `["node", "main.js"]`.

| Why |
|---|
| in the shell form a shell is the first process and swallows the stop signal, so every stop waits for the kill timeout. |
