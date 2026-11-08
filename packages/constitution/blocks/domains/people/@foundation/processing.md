# Processing

> Governs what personal data is processed: its inventory, notice and assessment, what is collected and shared by default, how long it is kept, where it goes and what output it stays out of.

## Vocabulary

**Personal data** is information about a person who can be identified by it, alone or with other data.

The **inventory** is the project's record of every kind of personal data the program handles.

An **audit record** is a record, kept for security, of who did what, when and from where.

A **data recipient** is another party that personal data reaches: a processor, bound by terms to the program's purpose, or a controller, with a legal basis of its own, the person's processing consent among them.

## Inventory

### personal-data-inventoried · MUST

Every kind of personal data the program collects, stores or passes on is listed in the inventory. It is listed with its purpose, the legal basis of that purpose, its retention period, the data recipients it reaches and the regions it is sent to.

#### Why

Data nobody listed is kept beyond its purpose and missed by every request to export or erase it.

#### Examples

```text title="Avoid"
inventory
  email address    kept
```

```text title="Prefer"
inventory
  email address
    purpose      order updates, sign-in
    basis        contract
    retention    account's life + 30 days
    recipients   mail provider (processor)
    regions      EU
```

### privacy-notice-follows-the-inventory · MUST

Every person whose data the program collects is told, where it is collected, what the inventory holds about it. That is what is collected, for which purpose and on which basis, who receives it, how long it is kept and how they use their rights.

#### Why

A person can use a right only over data they know is kept, and a notice written apart from the inventory drifts from what the program does.

#### Examples

```text title="Avoid"
Privacy notice

We may collect information to
improve our services.
```

```text title="Prefer"
Privacy notice

Email address: for order updates and
sign-in, under our contract with you.
Sent to our mail provider, in the EU.
Kept until 30 days after your account
closes. Export or erase it in
Settings, Privacy.
```

### high-risk-processing-assessed-before-it-starts · MUST

Wherever the law that binds the product asks it, every processing high-risk to people starts only after its impact is assessed. Such processing includes profiling on which decisions with legal or similarly significant effects on people rest, special categories of data at a large scale and systematic monitoring of a public area at a large scale.

#### Why

The GDPR's Article 35 asks for the assessment before such processing begins and names these three cases in Article 35(3), and a risk found after launch is found in people's data.

#### Examples

```text title="Avoid"
credit check at checkout
  May 02   launched
  Jun 15   impact assessment started
```

```text title="Prefer"
credit check at checkout
  Apr 10   impact assessment done,
           risks and their measures signed off
  May 02   launched
```

### impact-assessment-kept-beside-the-inventory · SHOULD

Every assessment of a processing's impact is kept beside the inventory.

#### Why

An assessment kept apart from the inventory is not found when the processing it weighed changes, so the change goes on unassessed.

#### Examples

```text title="Avoid"
shop/
└── privacy/
    └── inventory
credit-check assessment   in a shared drive
```

```text title="Prefer"
shop/
└── privacy/
    ├── inventory
    └── assessments/
        └── credit-check
```

## Collection

### personal-data-collected-only-for-its-purpose · MUST

All personal data is collected only as far as a stated purpose needs.

#### Why

Data collected beyond what a purpose needs can leak, be misused and must be found for every request, though nothing needed it — data minimisation.

#### Examples

```pseudo title="Avoid"
# newsletter/application/use-cases/commands/subscribe.use-case
type SubscribeInput = {
  email: Email,
  birthDate: Date,
  phone: Phone
}
```

```pseudo title="Prefer"
# newsletter/application/use-cases/commands/subscribe.use-case
type SubscribeInput = {
  email: Email
}
```

### sharing-settings-start-most-protective · MUST

Every setting that shares or exposes a person's data starts at its most protective, until the person changes it.

#### Why

A person who never opens the settings is otherwise exposed by a default nobody chose for them — privacy by default.

#### Examples

```pseudo title="Avoid"
# profiles/domain/profile/transitions/profile.transitions
function create(profileId, personId)
  return { id: profileId, personId, visibility: Public, wishlistShared: true }
```

```pseudo title="Prefer"
# profiles/domain/profile/transitions/profile.transitions
function create(profileId, personId)
  return { id: profileId, personId, visibility: Private, wishlistShared: false }
```

## Retention

### personal-data-kept-no-longer-than-its-retention · MUST

All personal data is deleted or made anonymous when the retention period of its purpose ends. Exempt: a backup, which keeps the data until the retention period the project sets for its backups ends.

#### Why

Data kept past its purpose is a liability that grows with every breach and every request.

#### Examples

```text title="Avoid"
closed accounts
  retention   30 days
  deleted     never
```

```text title="Prefer"
closed accounts
  retention   30 days
  deleted     daily by erase-closed-accounts,
              every account closed 30 days ago
```

## Recipients and output

### personal-data-reaches-only-a-listed-recipient · MUST

All personal data reaches only a data recipient the inventory lists.

#### Why

Data handed to a party nobody listed is data no request to export or erase reaches, under terms nobody read.

#### Examples

```text title="Avoid"
email address
  inventory lists   mail provider
  code sends to     mail provider, review widget
```

```text title="Prefer"
email address
  inventory lists   mail provider, review widget
                    (processors, under terms)
  code sends to     mail provider, review widget
```

### personal-data-leaves-its-region-only-under-an-allowed-transfer · MUST

All personal data leaves the region whose law protects it only under a transfer that law allows.

#### Why

Data sent out of its region under no allowed transfer loses the protection the GDPR gave it, and its sender answers for the loss.

#### Examples

```text title="Avoid"
EU customers' support tickets
  sent to   help-desk tool, hosted in the US
  under     no transfer basis
```

```text title="Prefer"
EU customers' support tickets
  sent to   help-desk tool, hosted in the US
  under     standard contractual clauses,
            signed 2026-02-01
```

### personal-data-kept-out-of-output · MUST

All personal data stays out of every log, error, crash report, URL, build artefact, test data and document of the project. A record is named there by an identifier that carries no personal data. Exempt: an error that reaches only the person the data is about, and an audit record, which holds the identifier and the network address its event needs and nothing more.

#### Why

Output is copied to places with weaker access than the data it came from, so personal data written there reaches people it was never meant for, and an audit record that holds more than who acted and from where becomes one more such copy.

#### Examples

```pseudo title="Avoid"
logger.info("order placed", { email: customer.email, orderId: order.id })

redirect("/orders/thanks?email=" + customer.email)
```

```pseudo title="Prefer"
logger.info("order placed", { customerId: customer.id, orderId: order.id })

redirect("/orders/" + order.id + "/thanks")
```
