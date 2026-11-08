# Alerts

> Governs the objectives the served work is held to and the alerts that watch them.

## Vocabulary

A kind of work item's **service level objective** is a target for an indicator measured where its users feel it, over a window of time. Such an indicator is the share of good answers or the share served within a duration.

## Objectives

### served-work-has-a-service-level-objective · SHOULD

Every kind of work item the program's users depend on has a service level objective.

| Why |
|---|
| without a target and its window nobody knows how much failure users can bear, so shipping and fixing are weighed by guess, and no alert can tell a budget burning from a passing blip. |

### service-level-objective-kept-in-the-repository · SHOULD

Every service level objective is kept in the repository, beside the code it holds to account.

| Why |
|---|
| an objective kept only in a monitoring console changes apart from the code it measures, and no review sees it drift. |

## Triggers

### alert-fires-on-what-users-feel · SHOULD

Every alert on the health of served work fires on the rate at which an objective's error budget burns. That budget is the share of the work items in the objective's window that its target lets fail. The alert never fires on a single sample past a fixed bound, nor on a cause such as a busy processor.

| Why |
|---|
| an alert on a cause wakes someone for what nobody noticed and stays silent for a failure with a cause nobody listed, and one on a fixed bound fires on every short spike and misses a slow burn that spends the budget all the same, while the rate at which the budget burns, watched over a long and a short window together, catches both — alert on symptoms, not causes. |
