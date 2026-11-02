# Alerts

> Governs the objectives the served work is held to and the alerts that watch them.

## Objectives

### served-work-has-a-service-level-objective · SHOULD

Served work that users depend on has a service level objective. Every kind of request or task the program serves that its users depend on has one: an indicator measured where users feel it — the share of good answers, the share served within a duration — a target and a window, kept with the code.

| Why |
|---|
| without a target and its window nobody knows how much failure users can bear, so shipping and fixing are weighed by guess, and no alert can tell a budget burning from a passing blip. |

## Triggers

### alert-fires-on-what-users-feel · SHOULD

An alert fires on what users feel: the rate at which an objective's error budget burns. An alert on the health of the served work watches that rate over a long and a short window together, never a single sample past a fixed bound nor a cause such as a busy processor.

| Why |
|---|
| an alert on a cause wakes someone for what nobody noticed and stays silent for a failure with a cause nobody listed, and one on a fixed bound fires on every short spike and misses a slow burn that spends the budget all the same — alert on symptoms, not causes. |
