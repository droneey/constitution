# Agency

> Governs the model tools a language model the program runs may call, the rights they act with, the calls that wait for a person, what a model run may send and the code a language model writes.

## Vocabulary

A **model tool** is a function the program hands a language model to call, which core's tools chapter counts as no tool.

A **model run** is one model task carried out by a language model that calls model tools in turn until it answers or stops, for the person it acts for, its person; one with no person present, such as one a schedule starts, is an **unattended run**.

A **run grant** is a record, kept by the program, that the person a model run acts for or the project sets in advance to bound an unattended run: its model task, the actions it allows, their bounds and its expiry.

A **consequential tool call** is a model tool call that destroys data, spends money, changes another system or sends something in a person's name.

## Tools

### model-given-only-the-tools-its-task-needs · MUST

Every model run is given model tools that reach no further than its model task needs. Each is as narrow as that task, such as a search over one index, never a query in any language.

#### Why

Every model tool a language model holds is one that text it reads can make it call, so the reach of the set it holds is the most an injection can do — least privilege.

#### Examples

```pseudo title="Avoid"
let orderStatusRun = startRun({
  task: "answer order status",
  tools: [runSql, fetchUrl, sendEmail],
})
```

```pseudo title="Prefer"
let orderStatusRun = startRun({
  task: "answer order status",
  tools: [findOrderByNumber, trackShipment],
})
```

### outside-tool-definition-pinned · MUST

Every model tool offered to a language model has the definition the program last reviewed. No definition that arrived with the request is offered.

#### Why

A model tool's description is a prompt its author can write or rewrite at any time, so a definition sent with the request or changed on its server since its review turns the language model against its own program.

#### Examples

```pseudo title="Avoid"
function toolsForRun(request, catalogServer)
  return request.tools + catalogServer.listTools()
```

```pseudo title="Prefer"
let reviewedTools = {
  trackShipment: "sha256:9f2c41e07b",
  findOrderByNumber: "sha256:31d8a6c2f0",
}

function toolsForRun(catalogServer)
  let definitions = catalogServer.listTools()

  for definition in definitions
    if hash(definition) is not reviewedTools[definition.name] then
      throw new ToolDefinitionChangedError(definition.name)

  return definitions
```

## Rights

### tool-acts-with-the-persons-rights → credential-has-least-privilege · MUST

Every model tool a language model calls acts with no more rights than the person its model run acts for. Exempt: an unattended run that acts for no person, whose model tools act with a service identity scoped to its model task.

#### Why

A language model is steered by what it reads, so a model tool with more rights than its person lends them to whoever wrote that text — least privilege.

#### Examples

```pseudo title="Avoid"
let readInvoice = modelTool("read_invoice", function(args, run)
  return invoices.find(args.invoiceId, adminCredentials))
```

```pseudo title="Prefer"
let readInvoice = modelTool("read_invoice", function(args, run)
  return invoices.find(args.invoiceId, run.person.credentials))
```

## Approval

### consequential-tool-call-approved-by-its-person · MUST

Every consequential tool call runs only once its person approves it. The approval is given for that call alone and shows it with the arguments it will run with. Exempt: a call of an unattended run, which runs only within its run grant.

#### Why

The person answers for the action, so a call run on the language model's word alone acts in their name on whatever steered the model, and an approval shown without the actual arguments approves a call other than the one that runs.

#### Examples

```pseudo title="Avoid"
let refundOrder = modelTool("refund_order", function(args, run)
  return payments.refund(args.orderId, args.amount, run.person))
```

```pseudo title="Prefer"
let refundOrder = modelTool("refund_order", function(args, run)
  let approval = run.person.approve({
    tool: "refund_order",
    orderId: args.orderId,
    amount: args.amount,
  })
  if not approval.granted then
    return toolRefused("the person declined the refund")

  return payments.refund(args.orderId, args.amount, run.person))
```

### unattended-tool-call-recorded · MUST

Every consequential tool call an unattended run makes within its run grant is recorded, call by call.

#### Why

No person saw the call when it ran, so a call left unrecorded cannot be checked against the grant, answered for or undone.

#### Examples

```pseudo title="Avoid"
let cancelStaleOrder = modelTool("cancel_order", function(args, run)
  if not run.grant.allows("cancel_order", args) then
    return toolRefused("outside the run grant")

  return orders.cancel(args.orderId, run.serviceIdentity))
```

```pseudo title="Prefer"
let cancelStaleOrder = modelTool("cancel_order", function(args, run)
  if not run.grant.allows("cancel_order", args) then
    return toolRefused("outside the run grant")

  call toolCallLog.record({
    runId: run.id,
    grantId: run.grant.id,
    tool: "cancel_order",
    arguments: args,
    at: clock.now(),
  })
  return orders.cancel(args.orderId, run.serviceIdentity))
```

## Ways out

### model-run-reading-outside-input-sends-nothing-unapproved · MUST

Wherever a model run reads outside input and can reach private data, every send it makes waits for its person's approval. A send is a request to an address the language model chooses, a message or a shared file, and private data is the agents chapter's term. Exempt: an unattended run's send to an address its run grant names.

#### Why

Text others wrote, private data and a way out together let whoever wrote the text take the data — the lethal trifecta.

#### Examples

```pseudo title="Avoid"
let sendEmail = modelTool("send_email", function(args, run)
  return mailer.send(args.to, args.body, run.person))

let inboxRun = startRun({
  task: "answer customer emails",
  reads: [customerEmails, customerAccounts],
  tools: [sendEmail],
})
```

```pseudo title="Prefer"
let sendEmail = modelTool("send_email", function(args, run)
  let approval = run.person.approve({ tool: "send_email", to: args.to, body: args.body })
  if not approval.granted then
    return toolRefused("the person declined the email")

  return mailer.send(args.to, args.body, run.person))

let inboxRun = startRun({
  task: "answer customer emails",
  reads: [customerEmails, customerAccounts],
  tools: [sendEmail],
})
```

## Code

### generated-code-runs-only-in-isolation · MUST

Every piece of code a language model writes runs only in isolation, never in the program's process or on its host. A command line it writes is such code, and isolation holds no credential, reaches no network beyond an allowlist and is bounded in time and in the memory it may allocate.

#### Why

Code a language model writes is written by whoever steered the model, and it runs with every right of the place it runs in.

#### Examples

```pseudo title="Avoid"
let report = shell.run(generated.command)
```

```pseudo title="Prefer"
let report = sandbox.run(generated.command, {
  credentials: [],
  network: ["data.example.com"],
  timeout: 30 seconds,
  memory: 512 MB,
})
```
