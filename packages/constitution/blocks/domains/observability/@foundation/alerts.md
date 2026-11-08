# Alerts

> Governs the objectives the served work is held to and the alerts that watch them.

## Vocabulary

A kind of work item's **service level objective** is a target for an indicator measured where its users feel it, over a window of time. Such an indicator is the share of good answers or the share served within a duration.

## Objectives

### served-work-has-a-service-level-objective · SHOULD

Every kind of work item the program's users depend on has a service level objective.

#### Why

Without a target and its window nobody knows how much failure users can bear, so shipping and fixing are weighed by guess, and no alert can tell a budget burning from a passing blip.

#### Examples

```text title="Avoid"
work item    check-out
objective    none
```

```text title="Prefer"
work item    check-out
objective    99.5% of check-outs answered
             without a failure, within 2 s
window       28 days
```

### service-level-objective-kept-in-the-repository · SHOULD

Every service level objective is kept in the repository, beside the code it holds to account.

#### Why

An objective kept only in a monitoring console changes apart from the code it measures, and no review sees it drift.

#### Examples

```text title="Avoid"
shop/
└── src/
objective check-out   set by hand in the
                      monitoring console
```

```text title="Prefer"
shop/
├── objectives/
│   └── check-out   99.5% within 2 s,
│                   over 28 days
└── src/
```

## Triggers

### alert-fires-on-what-users-feel · SHOULD

Every alert on the health of served work fires on the rate at which an objective's error budget burns. That budget is the share of the work items in the objective's window that its target lets fail. The alert never fires on a single sample past a fixed bound, nor on a cause such as a busy processor.

#### Why

An alert on a cause wakes someone for what nobody noticed and stays silent for a failure with a cause nobody listed, and one on a fixed bound fires on every short spike and misses a slow burn that spends the budget all the same, while the rate at which the budget burns, watched over a long and a short window together, catches both — alert on symptoms, not causes.

#### Examples

```text title="Avoid"
alert check-out
  fires when  processor above 90%
          or  one sample of p99 above 2 s
```

```text title="Prefer"
alert check-out
  objective   99.5% within 2 s, over 28 days
  fires when  the error budget burns 14 times
              too fast over 1 hour and over
              the last 5 minutes
```
