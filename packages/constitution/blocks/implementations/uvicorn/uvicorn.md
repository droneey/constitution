---
id: uvicorn
summary: Uvicorn, the ASGI server — it stops when the program says.
requires: [python, server]
languages: []
governs: ["**/root/**"]
---

# Uvicorn

> The `uvicorn` package, the ASGI server that runs the program's app over HTTP.

The composition root builds a `uvicorn.Config` and runs the app on a `uvicorn.Server`, whose `handle_exit` receives SIGINT and SIGTERM.
