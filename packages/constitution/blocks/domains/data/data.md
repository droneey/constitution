---
id: data
summary: "Data the program decides on: storage, transactions, schema migrations."
requires: [contracts]
languages: []
governs: ["**"]
---

# Data

> Data the program owns and decides on, whether a change is valid being the program's own rule: its consistency, the events that announce its changes, its transactions and processes, who owns it, how it is read and rebuilt, its storage and backups, and its schema migrations, and, on the architecture axis, the data ports a use case reaches it through.

A project whose store the program reaches over a network lists `transports` beside this block.
