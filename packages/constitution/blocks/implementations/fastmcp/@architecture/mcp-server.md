# MCP server

> Governs how the root assembles the server: the tools it registers and the handler it gives the server's failures.

## General

### tools-built-by-a-function-the-root-calls → delivery-unit-registered-by-the-root · MUST

`root/` registers every tool through a function a presentation offers. Each presentation of a feature, of a composition module or of the program offers a function that builds its tools from the context the root hands it, as a `FastMCP` server of its own that the root mounts or as tools the root adds, and no tool is decorated onto a server its module builds as it loads.

| Why |
|---|
| a tool decorated onto a server as its module loads registers itself, so no one place lists what the program answers, and it closes over whatever its module built, so a spec cannot build the server with fakes. |

### tool-failures-answered-by-one-middleware → one-error-handler-registered-by-the-root · MUST

The one error handler is a middleware that `root/` adds to the server. Its `on_call_tool` answers every failure of a call.

| Why |
|---|
| a handler inside each tool misses what fastmcp raises before the tool runs, a refused argument or an unknown tool, while the middleware wraps every call and receives those too. |
