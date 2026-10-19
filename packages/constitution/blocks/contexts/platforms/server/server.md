---
id: server
summary: A long-running process a host starts, routes to, restarts and stops.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
---

# Server

> A program that runs until its host stops it — in a container, a virtual machine or a platform's process — and serves requests or works through messages and schedules.

The program's host decides when it starts, when work is routed to it, how many copies of it run and when it is killed; the program tells its host whether it is alive and ready, and stops when told.
