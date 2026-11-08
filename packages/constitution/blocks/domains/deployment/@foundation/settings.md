# Settings

> Governs how a setting enters the program, the source it is taken from among several, and how its configuration changes while it runs.

## Vocabulary

The program's **configuration declaration** names, in one place, each setting its host hands it, every secret included: its type, how it is parsed, whether it is required or its default, whether it may change while the program runs, and, where two sources reach the same runs, the one that wins.

A setting of this block is one its host hands the program. A value a run's user hands it to choose how it behaves, such as one among its arguments, one in a file the user keeps for the folder the run works in or for all their runs, or a preference the program keeps for them, is none, and neither is what a run works on, such as a file whose content it processes or applies, or a value such a file refers to.

## Entry

### configuration-enters-only-through-its-declaration · MUST

Every setting its host hands the program enters it only through its configuration declaration, read only by its declared names.

#### Why

A setting read past the declaration, by a name nobody declared, escapes every check and every reader looking for what the program reads, so a typo in its name or its value goes unseen.

#### Examples

```pseudo title="Avoid"
# infrastructure/config
let Config = {
  smtpHost: Host,
}

function parseConfig(env)
  let config = parse(Config, env)

  return { ...config, smtpPort: toInteger(env("SMTP_PORT")) }  # a name the declaration never names
```

```pseudo title="Prefer"
# infrastructure/config
let Config = {
  smtpHost: Host,
  smtpPort: Port,
}

function parseConfig(env)
  return parse(Config, env)
```

### setting-taken-from-its-most-specific-source · MUST

Every setting its host hands the program from several sources is taken from the most specific source that gives it. A source is more specific than another when it reaches fewer of the program's runs, and a default the program ships with is less specific than every source. Where two sources reach the same runs, the configuration declaration names the one that wins.

#### Why

In any other order a broader choice outranks a narrower one, so a value set for one instance or one deployment environment cannot win without the source every other one shares being edited.

#### Examples

```text title="Avoid"
setting checkoutTimeout
  default                  10 s
  deployment production    5 s
  instance eu-2            8 s
  taken on eu-2            5 s, the broader source wins
```

```text title="Prefer"
setting checkoutTimeout
  default                  10 s
  deployment production    5 s
  instance eu-2            8 s
  taken on eu-2            8 s
```

### missing-setting-fails-the-start-of-its-work → outside-value-parsed-once-where-it-enters · MUST

Every missing or malformed setting fails the start of the work that needs it, before that work begins. A setting is missing when its declaration requires it and its host hands it none. Such work is the program, a subcommand or the part that reads the setting.

#### Why

A setting checked where it is first used fails in the middle of a request, long after the deployment that broke it — fail fast.

#### Examples

```pseudo title="Avoid"
# infrastructure/smtp/smtp-mailer.adapter
function createSmtpMailer({ smtpHost: Text })
  return {
    send: function(invoice, context)
      let client = new SmtpClient(parseHost(smtpHost))  # a malformed host fails the first send
      return client.send(renderInvoice(invoice), { signal: context.signal })
  }
```

```pseudo title="Prefer"
# infrastructure/config
let Config = {
  databaseUrl: Url,
  smtpHost: Host,
}

# root/run
function run(env)
  let config = parseConfig(env)
  let mailer = createSmtpMailer({ smtpHost: config.smtpHost })
```

## Changes while it runs

### changed-configuration-applied-whole-or-refused · MUST

While the program runs, the settings its host hands it change only as a whole set its declaration checked. A changed set is checked whole and swapped in at once, and a set that fails is refused, the last valid set kept.

#### Why

A changed value applied in part or unchecked runs the program on a state no start validated.

#### Examples

```pseudo title="Avoid"
function onConfigChanged(raw, holder)
  for key in raw.keys
    holder.set(key, raw[key])
```

```pseudo title="Prefer"
function onConfigChanged(raw, holder, logger)
  let parsed = parseConfig(raw)

  when parsed
    is Invalid then logger.warn("configuration refused", { problems: parsed.problems })
    is Valid then holder.swap(parsed.config)
```

### operation-keeps-the-configuration-it-started-with · MUST

Every operation runs to its end on the configuration set it started with.

#### Why

An operation that sees two sets mixes them, and does what neither set meant.

#### Examples

```pseudo title="Avoid"
function quoteShipping(request, holder)
  let baseCents = priceByWeight(request.weightGrams, holder.current().ratePerKilo)

  return baseCents + surchargeOf(baseCents, holder.current().fuelPercent)  # may read a newer set
```

```pseudo title="Prefer"
function quoteShipping(request, holder)
  let config = holder.current()
  let baseCents = priceByWeight(request.weightGrams, config.ratePerKilo)

  return baseCents + surchargeOf(baseCents, config.fuelPercent)
```

### setting-changes-live-only-where-declared · MUST

While the program runs, every setting its host hands it changes only where its declaration allows it. One that sized or opened something at start, such as a pool, a listening address or a storage path, takes a restart.

#### Why

A setting changed under something it sized or opened at start leaves that thing as it was while the program reports the new value.

#### Examples

```pseudo title="Avoid"
# infrastructure/config
let Config = {
  databasePoolSize: live(PositiveInteger),  # the pool was sized at start
  ratePerKilo: live(Money)
}
```

```pseudo title="Prefer"
# infrastructure/config
let Config = {
  databasePoolSize: PositiveInteger,
  ratePerKilo: live(Money)
}
```
