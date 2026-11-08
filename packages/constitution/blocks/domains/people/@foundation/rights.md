# Rights

> Governs a person's requests to export, erase and correct their data and to object, and the opt-out preference signals they send.

## Requests

### personal-data-exported-on-request · MUST

Every person's request to export their data is carried out in full, within the time the law that binds the product sets. The export holds all of their data, in a format a machine reads.

#### Why

Data missed by the export is data the person cannot check.

#### Examples

```pseudo title="Avoid"
# composition/data-rights/application/use-cases/queries/export-personal-data.use-case
function createExportPersonalData({ getProfile })
  return function(input, context)
    return renderPdf(await getProfile({ personId: input.personId }, context))  # orders and addresses left out
```

```pseudo title="Prefer"
# composition/data-rights/application/use-cases/queries/export-personal-data.use-case
function createExportPersonalData({ getProfile, listOrders, listAddresses, listConsentChoices })
  return function(input, context)
    let query = { personId: input.personId }

    return toJson({
      profile: await getProfile(query, context),
      orders: await listOrders(query, context),
      addresses: await listAddresses(query, context),
      consentChoices: await listConsentChoices(query, context)
    })
```

### personal-data-corrected-on-request · MUST

Every person's request to correct their data is carried out within the time the law that binds the product sets.

#### Why

Data a person knows is wrong goes on deciding about them until it is fixed.

#### Examples

```text title="Avoid"
law's limit   one month
Mar 01        asked to correct the
              delivery address
Jun 12        corrected
```

```text title="Prefer"
law's limit   one month
Mar 01        asked to correct the
              delivery address
Mar 02        corrected, person told
```

### rights-request-verified-before-it-is-answered · MUST

Every request about a person's data is answered only once the requester is shown to be that person. Such a request is one to export, erase or correct the data, and the proof is their sign-in where they have an account, otherwise a check proportionate to the data.

#### Why

An export sent to an impostor is a breach, and an erasure on a stranger's word destroys a person's data.

#### Examples

```pseudo title="Avoid"
# composition/data-rights/presentation/bindings/commands/request-export
function onRequestExport(request, requestExport, context)
  await requestExport({ email: request.body.email }, context)  # anyone may name anyone's address

  return accepted()
```

```pseudo title="Prefer"
# composition/data-rights/presentation/bindings/commands/request-export
function onRequestExport(request, requestExport, context)
  if context.session is <absent> then
    return unauthenticated()

  await requestExport({ personId: context.session.personId }, context)

  return accepted()
```

### personal-data-erased-on-request · MUST

Every person's request to erase their data erases it from every store, cache and processor that keeps it. It is carried out within the time the law that binds the product sets. Exempt: what a law makes the program keep; a backup, which keeps the data until the retention period the project sets for its backups ends; and an audit record, which keeps the identifier and the network address its event needs until the retention period the project sets for audit records ends.

#### Why

A copy left behind is data the person was told was gone.

#### Examples

```pseudo title="Avoid"
# composition/data-rights/application/use-cases/commands/erase-person.use-case
function createErasePerson({ eraseAccount })
  return function(input, context)
    await eraseAccount(input, context)  # orders, search and the mailing list keep the data
```

```pseudo title="Prefer"
# composition/data-rights/application/use-cases/commands/erase-person.use-case
function createErasePerson({ eraseAccount, anonymiseOrders, eraseFromSearch, eraseFromMailingList })
  return function(input, context)
    await eraseAccount(input, context)
    await anonymiseOrders(input, context)
    await eraseFromSearch(input, context)
    await eraseFromMailingList(input, context)
```

### erasure-passed-on-to-recipients · MUST

Every erasure is passed on to every controller the data reached, within the time the law that binds the product sets. Exempt: what a law makes the program keep.

#### Why

A controller that never hears of the erasure keeps the data the person was told was gone.

#### Examples

```text title="Avoid"
erasure of person 4812
  shop's stores          erased, day 1
  insurer (controller)   never told
```

```text title="Prefer"
erasure of person 4812
  shop's stores          erased, day 1
  insurer (controller)   told, day 1
                         confirmed, day 3
```

### objection-honoured · MUST

Every objection to a processing on the program's legitimate interest, or to direct marketing, stops that processing. It stops within the time the law that binds the product sets. Exempt: a processing other than direct marketing for which the inventory records grounds that override the person's.

#### Why

The GDPR gives a person the right to object to what the program does on its own interest, and an absolute one against marketing, so a processing that goes on after either is unlawful.

#### Examples

```pseudo title="Avoid"
# marketing/application/use-cases/commands/send-newsletter.use-case
function createSendNewsletter({ customerQueries, mailer })
  return function(input, context)
    for customer in await customerQueries.listAll(context)  # those who objected included
      await mailer.send(newsletterFor(customer, input.issue), context)
```

```pseudo title="Prefer"
# marketing/application/use-cases/commands/send-newsletter.use-case
function createSendNewsletter({ customerQueries, mailer })
  return function(input, context)
    for customer in await customerQueries.listReachableByMarketing(context)
      await mailer.send(newsletterFor(customer, input.issue), context)
```

## Opt-out preference signals

### opt-out-signal-honoured · MUST

Wherever the law that binds the product requires it, every user agent's opt-out preference signal is honoured as the person's opt-out. The signal, such as Global Privacy Control, opts the person out of the sale and sharing of their data and of targeted advertising.

#### Why

The signal is the person's choice made once for every site, and the laws that make it binding, California's CCPA among them, fine whoever ignores it.

#### Examples

```pseudo title="Avoid"
# presentation/consent/on-visit
function onVisit(request, visitor)
  return choicesOf(visitor)  # Sec-GPC: 1 ignored
```

```pseudo title="Prefer"
# presentation/consent/on-visit
function onVisit(request, visitor)
  if request.headers["sec-gpc"] == "1" then
    return optedOutOfSaleAndTargeting(choicesOf(visitor))

  return choicesOf(visitor)
```
