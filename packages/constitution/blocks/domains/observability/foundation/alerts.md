# Alerts

> Governs the objectives the served work is held to and the alerts that watch them.

## Objectives

### served-work-has-a-service-level-objective · SHOULD

Every kind of request or task the program serves that its users depend on has a service level objective: an indicator measured where users feel it — the share of good answers, the share served within a duration — a target and a window, kept with the code.

| Why |
|---|
| a target and its window say how much failure users can bear, so the budget it leaves decides between shipping and fixing, and an alert can measure what is left of it. |

## Triggers

### alert-fires-on-what-users-feel · SHOULD

An alert on the health of the work the program serves fires on what its users feel: on the rate at which an objective's error budget burns, over a long and a short window together, never on a single sample past a fixed bound nor on a cause such as a busy processor.

| Why |
|---|
| an alert on a cause wakes someone for what nobody noticed and stays silent for a failure with a cause nobody listed, and one on a fixed bound fires on every short spike and misses a slow burn that spends the budget all the same. |
