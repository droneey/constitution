# Plan and apply

> Governs the reconciliation plan and the reconciliation apply.

## Vocabulary

The program's **mark of ownership** is a sign, such as a label, that it puts on what it creates in the managed world, telling it from what others made.

A **reconciliation target** is the part of the managed world one config file manages.

## Plan

### plan-reads-the-observed-world · MUST

Every reconciliation plan compares the config file with the observed world. It reads the managed world when the reconciliation plan is made, never only a record of the last reconciliation run.

#### Why

A reconciliation plan built from a record alone misses what changed outside the program, a change made by hand among them, and the reconciliation apply then overwrites it or fails on it unseen.

#### Examples

```pseudo title="Avoid"
# sites/application/use-cases/queries/plan-site.use-case
function createPlanSite({ stateRecords })
  return function(input, context)
    let lastApplied = stateRecords.find(input.config.target, context)

    return planChanges(input.config, lastApplied)
```

```pseudo title="Prefer"
# sites/application/use-cases/queries/plan-site.use-case
function createPlanSite({ world })
  return function(input, context)
    let observed = world.observe(input.config.target, context)

    return planChanges(input.config, observed)
```

### plan-outcome-told-apart · MUST

Every reconciliation plan's outcome tells no change, a change and a failure apart. It does so in a form a caller branches on, such as the reconciliation run's exit status, never only in its text.

#### Why

A script or a schedule that checks for drift cannot tell “all in place” from “could not look” by reading prose.

#### Examples

```pseudo title="Avoid"
function main(arguments)
  let outcome = runPlan(arguments.configPath)

  print(outcome.summary)
  exit(0)
```

```pseudo title="Prefer"
let FAILED_EXIT_STATUS = 1
let CHANGES_EXIT_STATUS = 2

function main(arguments)
  let outcome = runPlan(arguments.configPath)

  print(outcome.summary)

  when outcome
    is NoChange then exit(0)
    is Failed then exit(FAILED_EXIT_STATUS)
    is Changes then exit(CHANGES_EXIT_STATUS)
```

### plan-names-destroying-changes · MUST

Every reconciliation plan names each change that destroys something.

#### Why

A destroyed resource cannot be restored, so one destroyed unseen is lost for good.

#### Examples

```text title="Avoid"
$ sitectl plan site.config
3 changes
  + record api       CNAME api.shop.example.net
  ~ record www       ttl 300 -> 600
  ~ bucket invoices  region eu-west -> eu-central
```

```text title="Prefer"
$ sitectl plan site.config
4 changes, 1 destroys
  + create    record api       CNAME api.shop.example.net
  ~ update    record www       ttl 300 -> 600
  - DESTROY   bucket invoices  a region change replaces it
  + create    bucket invoices  region eu-central
```

### destroying-change-applied-only-on-explicit-approval · MUST

Every change that destroys something is carried out by a reconciliation apply only on an explicit approval of that change.

#### Why

A destroyed resource cannot be restored, so one destroyed unasked is lost for good — fail-safe defaults.

#### Examples

```text title="Avoid"
$ sitectl apply site.config
  + create    record api
  - DESTROY   bucket invoices
Applied 2 changes.
```

```text title="Prefer"
$ sitectl apply site.config
  + create    record api
  - DESTROY   bucket invoices
Destroy bucket invoices? Type its name to approve: invoices
Applied 2 changes.

$ sitectl apply site.config --approve-destroy bucket/invoices
```

## Apply

### apply-carries-out-the-plan-shown · MUST

Every reconciliation apply carries out exactly the reconciliation plan it acts on: the one its user was shown, or, for a reconciliation apply nobody watches, the one its reconciliation run made.

#### Why

A user approves the reconciliation plan they read, and a reconciliation apply that does something else does what nobody approved.

#### Examples

```pseudo title="Avoid"
function runApply(config, { planSite, applyPlan }, context)
  let shown = planSite({ config }, context)
  print(shown)
  awaitApproval(shown)

  let plan = planSite({ config }, context)  # not the plan the user approved
  applyPlan({ plan }, context)
```

```pseudo title="Prefer"
function runApply(config, { planSite, applyPlan }, context)
  let plan = planSite({ config }, context)
  print(plan)
  awaitApproval(plan)

  applyPlan({ plan }, context)
```

### stale-plan-never-applied → write-on-read-data-is-conditional · MUST

No reconciliation plan is applied once the config file or the managed world it was made from has changed. The reconciliation apply is refused, and asks for a new reconciliation plan.

#### Why

A reconciliation plan made from a managed world that has since moved changes it as it no longer is and undoes or doubles what moved it, one made from a config file that has since changed carries out what its user no longer declares, and only a new one shows the user what the reconciliation run will now do.

#### Examples

```pseudo title="Avoid"
# sites/application/use-cases/commands/apply-plan.use-case
function createApplyPlan({ world })
  return function(input, context)
    for change in input.plan.changes
      call world.carryOut(change, context)
```

```pseudo title="Prefer"
# sites/application/use-cases/commands/apply-plan.use-case
function createApplyPlan({ world, configFiles })
  return function(input, context)
    if configFiles.digest(input.plan.configPath) is not input.plan.configDigest then
      throw new StalePlanError(input.plan.id)

    for change in input.plan.changes
      # Why: the world refuses a change whose resource moved since it was observed
      call world.carryOut(change, { expectedVersion: change.observedVersion }, context)
```

### apply-changes-only-what-the-program-owns · MUST

Every reconciliation apply changes and removes only what carries the program's mark of ownership. Exempt: what its user adopted by an act of its own, such as an import command, which then takes the mark.

#### Why

A program that touches what it did not create destroys what other people and programs rely on.

#### Examples

```pseudo title="Avoid"
# sites/domain/plan/services/plan-changes.service
function planRemovals(declared, observed)
  return observed.records
    .filter(record => not declared.hasRecord(record.name))
    .map(destroy)
```

```pseudo title="Prefer"
# sites/domain/plan/services/plan-changes.service
function planRemovals(declared, observed)
  return observed.records
    .filter(record => hasOwnershipMark(record))
    .filter(record => not declared.hasRecord(record.name))
    .map(destroy)
```

### unowned-declared-resource-fails-the-plan · MUST

Every reconciliation plan fails on what the config file declares and the managed world already holds without the program's mark of ownership.

#### Why

A reconciliation apply may neither change what it does not own nor create a second one beside it, so a reconciliation plan that passes over it reports the declared state reached while another's resource stands in its place, and only a failure that names it tells its user to adopt it or to declare another.

#### Examples

```pseudo title="Avoid"
# sites/domain/plan/services/plan-changes.service
function planRecord(declared, observed)
  if observed is <absent> then
    return create(declared)

  if not hasOwnershipMark(observed) then
    return noChange()  # another's record left standing in its place

  if matches(observed, declared) then
    return noChange()

  return update(observed, declared)
```

```pseudo title="Prefer"
# sites/domain/plan/services/plan-changes.service
function planRecord(declared, observed)
  if observed is <absent> then
    return create(declared)

  if not hasOwnershipMark(observed) then
    throw new UnownedResourceError(observed.id)

  if matches(observed, declared) then
    return noChange()

  return update(observed, declared)
```

### created-resource-carries-the-ownership-mark · MUST

Everything a reconciliation apply creates carries the program's mark of ownership.

#### Why

What the program created without its mark is left behind by every later reconciliation run, which no longer recognises it as its own to change or remove.

#### Examples

```pseudo title="Avoid"
# sites/infrastructure/storage/bucket-world.adapter
function createBucket(declared, context)
  return storageClient.createBucket({
    name: declared.name,
    region: declared.region
  }, context)
```

```pseudo title="Prefer"
# sites/infrastructure/storage/bucket-world.adapter
function createBucket(declared, context)
  return storageClient.createBucket({
    name: declared.name,
    region: declared.region,
    labels: OWNERSHIP_MARK_LABELS
  }, context)
```

### generated-secret-written-to-a-secret-store · MUST

Every secret a reconciliation apply generates itself is written, as it is generated, to a secret store the config file names.

#### Why

A generated secret held only in memory is lost with the reconciliation run, so the next reconciliation apply generates another and locks out what the first one opened.

#### Examples

```pseudo title="Avoid"
# sites/application/use-cases/commands/apply-plan/steps/grant-bucket-key
function grantBucketKey(bucket, { world }, context)
  let key = generateSecret()

  call world.grantKey(bucket.name, key, context)
```

```pseudo title="Prefer"
# sites/application/use-cases/commands/apply-plan/steps/grant-bucket-key
function grantBucketKey(bucket, { world, secretStore }, context)
  let key = generateSecret()
  call secretStore.write(bucket.keySecretName, key, context)

  call world.grantKey(bucket.name, key, context)
```

### second-run-changes-nothing → operation-idempotent-by-design · MUST

Every second reconciliation apply of the same config file, on a managed world nothing else changed meanwhile, changes nothing. It reports no change.

#### Why

A reconciliation apply that is not idempotent changes the managed world again on every rerun after a failure or on a schedule.

#### Examples

```pseudo title="Avoid"
# sites/domain/plan/services/plan-changes.service
function planRecord(declared, observed)
  if observed is <absent> then
    return create(declared)

  if not hasOwnershipMark(observed) then
    throw new UnownedResourceError(observed.id)

  return update(observed, declared)  # updates it again on every run
```

```pseudo title="Prefer"
# sites/domain/plan/services/plan-changes.service
function planRecord(declared, observed)
  if observed is <absent> then
    return create(declared)

  if not hasOwnershipMark(observed) then
    throw new UnownedResourceError(observed.id)

  if matches(observed, declared) then
    return noChange()

  return update(observed, declared)
```

### idempotent-apply-proven-by-a-test · SHOULD

Every program with a reconciliation apply has a test that applies one config file twice and finds no change the second time.

#### Why

Only a test catches the first change that makes a second reconciliation apply change the managed world again, before a rerun in production does.

#### Examples

```pseudo title="Avoid"
test "should create the declared record"
  # Arrange
  let world = createFakeWorld()
  let config = createConfig({ records: [createRecord({ name: "www" })] })

  # Act
  call reconcile(config, world)

  # Assert
  assert world.records.has("www")
```

```pseudo title="Prefer"
test "should change nothing when the same config file is applied twice"
  # Arrange
  let world = createFakeWorld()
  let config = createConfig({ records: [createRecord({ name: "www" })] })
  call reconcile(config, world)

  # Act
  let second = reconcile(config, world)

  # Assert
  assert second.outcome is NoChange
```

### one-apply-at-a-time · MUST

One reconciliation apply at a time runs on each reconciliation target. A second one waits for the first or is refused.

#### Why

Two reconciliation applies made from one observed world each change it as if alone, and the second undoes or doubles the first.

#### Examples

```pseudo title="Avoid"
# sites/application/use-cases/commands/apply-plan.use-case
function createApplyPlan({ world })
  return function(input, context)
    call carryOut(input.plan, world, context)
```

```pseudo title="Prefer"
# sites/application/use-cases/commands/apply-plan.use-case
function createApplyPlan({ world, targetLocks })
  return function(input, context)
    let lease = targetLocks.acquire(input.plan.target, context)

    if lease is <absent> then
      throw new TargetBusyError(input.plan.target)

    try
      call carryOut(input.plan, world, lease, context)
    finally
      call targetLocks.release(lease, context)
```

### stopped-apply-frees-its-target · MUST

Every lock on a reconciliation target ends by itself once its reconciliation apply stops, a killed one's included.

#### Why

A reconciliation apply is broken off sooner or later, and a lock that needs clearing by hand afterwards turns one failure into an outage; a lock that ends by itself is also the only kind core lets a reconciliation apply hold across its calls to the managed world.

#### Examples

```pseudo title="Avoid"
# sites/infrastructure/state/target-locks.adapter
function acquire(target, context)
  if stateBucket.exists(lockKey(target), context) then
    return <absent>

  call stateBucket.write(lockKey(target), { runId }, context)  # outlives a killed run

  return { target, runId }
```

```pseudo title="Prefer"
# sites/infrastructure/state/target-locks.adapter
function acquire(target, context)
  return stateBucket.writeIfAbsent(lockKey(target), {
    runId,
    expiresAt: clock.now() + LEASE_DURATION
  }, context)

function renew(lease, context)
  call stateBucket.update(lockKey(lease.target), {
    expiresAt: clock.now() + LEASE_DURATION
  }, { runId: lease.runId }, context)
```
