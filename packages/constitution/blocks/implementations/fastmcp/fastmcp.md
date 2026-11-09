---
id: fastmcp
summary: FastMCP serves the program's tools to language models over MCP.
requires: [python, schema/pydantic, contracts/api/mcp]
languages: []
governs: ["**/presentation/**", "**/root/**", "**/tests/**"]
---

# FastMCP

> FastMCP, the package `fastmcp`, serves the program's tools, resources and prompts to language models over MCP.

A tool's docstring and annotations are all the language model knows of it, and pydantic parses its arguments before it runs.
