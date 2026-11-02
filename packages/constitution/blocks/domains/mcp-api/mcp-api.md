---
id: mcp-api
summary: A tool server language models call over the Model Context Protocol.
requires: []
extends: _api
abstract: false
languages: []
governs: ["**"]
---

# MCP API

> A server of tools that language models call over the Model Context Protocol.

The block's rules bind the tools the program serves, and no other: how a tool is defined for a language model, how it answers and fails, how it talks to the person, and its specs. Calling another program's tools is a remote service.
