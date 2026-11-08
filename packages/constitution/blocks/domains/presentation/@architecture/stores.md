# Stores

> Governs the state stores of the interface: which concerns they hold and what reaches the screens through them.

## Vocabulary

A **state store** holds a part of the interface's state in memory and tells what reads it when it changes; it keeps nothing beyond a run, unlike a store of the program's data.

## General

### interface-concern-kept-in-a-store-of-its-own · MUST

Each interface concern lives in a state store of its own, which holds that concern alone. An interface concern is a part of the interface's state that every screen shares and that the interface owns, such as the theme, the notices or whether a session exists.

| Why |
|---|
| two concerns in one state store change and notify their readers together, and one concern spread over several stores shows two screens two themes or two lists of notices — a single source of truth. |

### command-progress-reaches-the-screen-through-a-state-store · SHOULD

Every report a command makes through the progress reporter reaches the interface through a state store. The progress reporter's adapter writes each report to it under the identifier that addresses the report, and the screen or widget that started the command reads its own reports from it.

| Why |
|---|
| reports handed back by a path of their own, such as a callback threaded into the call, tie the binding unit to one screen, and reports no state store holds are lost to a screen that renders again or opens anew while its command runs. |
