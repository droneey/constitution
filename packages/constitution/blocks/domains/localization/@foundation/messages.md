# Messages

> Governs a catalogue message: the messages file and the catalogue it sits in, and its composition.

## Vocabulary

A **catalogue message** is one text of copy as a catalogue holds it, with the named parameters that fill it.

A locale's **catalogue** holds its catalogue messages, and the **source catalogue** holds them in the source language, in the program's messages files or extracted from its code.

A **messages file**, marked **`.messages`**{#message-file}, is a file that catalogue messages are written into in the source language; a locale's catalogue file, and a catalogue extracted from the code, are none.

The **catalogue library** holds the product's catalogues and renders their catalogue messages, and its **catalogue format** is the syntax a catalogue message is written in.

An error's **debug text** is the text it is built with for those who debug the program, not for its user.

## Catalogue

### text-a-person-reads-held-in-a-messages-file · SHOULD

All copy sits in a messages file beside the unit that shows it. It covers the text of a screen, a subcommand's help and the wording of a report. Exempt: an error's debug text, and a translation, which its locale's catalogue holds.

#### Why

Text written inside logic is reworded by editing that logic and reviewed as code, while text apart from it changes alone and the checks of logic leave it out by its kind.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order
function onCancelOrder(input, cancelOrder, context)
  await cancelOrder(input, context)

  showNotice(translate(message("Order cancelled."), context.locale))  # copy written inside logic
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/cancel-order.messages
let orderCancelled = "Order cancelled."

# orders/presentation/bindings/commands/cancel-order
function onCancelOrder(input, cancelOrder, context)
  await cancelOrder(input, context)

  showNotice(translate(messages.orderCancelled, context.locale))
```

### messages-file-carries-its-mark → file-named-for-its-kind · MUST

Every messages file carries its mark.

#### Why

A messages file named off its mark is missed by the tool that finds it by its name, so it is checked as logic or left out of what a translator is handed.

#### Examples

```text title="Avoid"
orders/presentation/bindings/queries/
├── show-order
└── show-order-texts
```

```text title="Prefer"
orders/presentation/bindings/queries/
├── show-order
└── show-order.messages
```

### messages-mark-marks-only-messages-files → kind-mark-marks-only-its-kind · MUST

No file but a messages file carries the messages file's mark.

#### Why

A mark on a file of another kind makes the tool that finds messages files by their name hand its code to a translator, or leave its logic out of the checks.

#### Examples

```text title="Avoid"
orders/presentation/bindings/queries/
├── show-order
├── show-order.messages
└── format-total.messages   formats amounts
```

```text title="Prefer"
orders/presentation/bindings/queries/
├── show-order
├── show-order.messages
└── format-total
```

### user-facing-text-from-the-catalogue · MUST

All copy comes from a catalogue. Exempt: an error's debug text.

#### Why

Text in code cannot be translated or reworded without a code change.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order
function onCancelOrder(input, cancelOrder, context)
  await cancelOrder(input, context)

  showNotice("Order cancelled.")
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/cancel-order
function onCancelOrder(input, cancelOrder, context)
  await cancelOrder(input, context)

  showNotice(translate(messages.orderCancelled, context.locale))
```

### translation-kept-in-its-locales-catalogue · MUST

Every translation lives only in its locale's catalogue, never in the source catalogue or in code.

#### Why

A translation kept beside its source text mixes every language's wording into one file, and one kept in code cannot be changed by a translator.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order.messages
let orderCancelled = {
  en: "Order cancelled.",
  uk: "Замовлення скасовано."
}
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/cancel-order.messages
let orderCancelled = "Order cancelled."

# locales/uk catalogue
orderCancelled = "Замовлення скасовано."
```

### source-catalogue-ships-with-its-code · MUST

Every change to the code's catalogue messages carries the change it makes to the source catalogue. Translations may follow in a later change.

#### Why

A source catalogue behind its code shows a text nobody can translate, and one ahead of it keeps texts nothing shows.

#### Examples

```text title="Avoid"
change 1   cancel-order shows refundIssued
           source catalogue unchanged
change 2   source catalogue gains refundIssued
```

```text title="Prefer"
change 1   cancel-order shows refundIssued
           source catalogue gains refundIssued
change 2   uk and pl catalogues translate it
```

### module-level-text-holds-the-message · MUST

Every text defined at a module's top level holds its catalogue message, never its translated result. Such text includes an option list and an enumeration's labels, and is translated where it is shown.

#### Why

A translation taken when the module loads keeps the locale of that moment, and a later switch of language misses it.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/queries/list-orders
let sortOptions = [
  { value: NewestFirst, label: translate(messages.newestFirst, currentLocale()) },  # fixed at load
  { value: OldestFirst, label: translate(messages.oldestFirst, currentLocale()) }
]
```

```pseudo title="Prefer"
# orders/presentation/bindings/queries/list-orders
let sortOptions = [
  { value: NewestFirst, label: messages.newestFirst },
  { value: OldestFirst, label: messages.oldestFirst }
]

function sortOptionsView(locale)
  return sortOptions.map(function(option) { ...option, label: translate(option.label, locale) })
```

### catalogue-format-read-by-translation-tools · MUST

Every catalogue is kept in a catalogue format that translation tools read.

#### Why

A format no translation tool reads is translated by hand, and every hand copy drifts from its source.

#### Examples

```text title="Avoid"
locales/
├── uk.messages   messages built by functions
└── pl.messages
```

```text title="Prefer"
locales/
├── uk.xliff
└── pl.xliff
```

### missing-catalogue-key-fails-the-check · SHOULD

Every missing or misspelt key of a catalogue message fails the check.

#### Why

A missing or misspelt key shows the user a raw key instead of text, and only a check finds it before they do.

#### Examples

```text title="Avoid"
$ check
lint      passed
types     passed
specs     passed
(cart.emptyTitel shows on screen as is)
```

```text title="Prefer"
$ check
lint      passed
types     passed
specs     passed
messages  cart.emptyTitel, used in
          carts/presentation/bindings/queries/show-cart,
          is in no catalogue: failed
```

## Composition

### messages-take-named-parameters · MUST

Every catalogue message takes its values as named parameters inside it.

#### Why

A parameter known only by its position gives the translator no clue what it holds, and a language that orders it otherwise moves the wrong value.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/queries/show-order.messages
let lineAdded = "{0} added {1}"
```

```pseudo title="Prefer"
# orders/presentation/bindings/queries/show-order.messages
let lineAdded = "{customerName} added {productName}"
```

### sentence-never-joined-from-strings · MUST

No sentence of copy is built by joining strings in code.

#### Why

Languages order words differently, so a sentence joined in code cannot be translated.

#### Examples

```pseudo title="Avoid"
# carts/presentation/bindings/queries/show-cart
let summary = translate(messages.youHave, locale) + " " + count + " " + translate(messages.itemsInYourCart, locale)
```

```pseudo title="Prefer"
# carts/presentation/bindings/queries/show-cart.messages
let cartSummary = "You have {count, plural, one {# item} other {# items}} in your cart."

# carts/presentation/bindings/queries/show-cart
let summary = translate(messages.cartSummary, locale, { count })
```

### interpolated-value-isolated-for-direction · MUST

Every value a person wrote that a catalogue message interpolates, such as a name or a title, is isolated for direction. Text of the other direction then never reorders the sentence around it.

#### Why

A right-to-left name inside a left-to-right sentence otherwise scrambles the words beside it.

#### Examples

```pseudo title="Avoid"
# reviews/presentation/bindings/queries/show-review
let byline = translate(messages.reviewedBy, locale, { reviewer: review.authorName })
```

```pseudo title="Prefer"
# reviews/presentation/bindings/queries/show-review
let byline = translate(messages.reviewedBy, locale, { reviewer: isolateDirection(review.authorName) })
```

### plural-forms-by-locale-rules · MUST

Every plural or ordinal form is chosen inside its catalogue message by the locale's CLDR rules, never by a condition in code. A test such as the count being one is such a condition.

#### Why

Many languages have more than two plural forms, and code written for one language gets the others wrong — CLDR's plural rules.

#### Examples

```pseudo title="Avoid"
# carts/presentation/bindings/queries/show-cart
let label = count == 1
  ? translate(messages.oneItem, locale)
  : translate(messages.manyItems, locale, { count })
```

```pseudo title="Prefer"
# carts/presentation/bindings/queries/show-cart.messages
let itemCount = "{count, plural, one {# item} other {# items}}"

# carts/presentation/bindings/queries/show-cart
let label = translate(messages.itemCount, locale, { count })
```

### message-variant-chosen-by-a-select · MUST

Every variant of a sentence that a value it speaks of changes is chosen by a select inside its catalogue message. Such a value is a gender, a role or a status, and code never chooses the variant.

#### Why

A variant chosen in code gives every language the source language's set of variants, and a language that needs another set cannot be translated.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/queries/show-order
let status = order.status is Refunded
  ? translate(messages.refundedOn, locale, { date })
  : translate(messages.paidOn, locale, { date })
```

```pseudo title="Prefer"
# orders/presentation/bindings/queries/show-order.messages
let paymentStatus = "{status, select, refunded {Refunded on {date}} paid {Paid on {date}} other {Awaiting payment}}"

# orders/presentation/bindings/queries/show-order
let status = translate(messages.paymentStatus, locale, { status: order.status, date })
```

### messages-file-holds-no-logic · SHOULD

All logic that picks one catalogue message among several sits outside the messages file. Such logic picks, for instance, a short or a long label by the screen's width, and names the catalogue messages it picks from. A plural, an ordinal or a select form chooses inside one catalogue message, and stays in it.

#### Why

Logic inside a messages file is left out of every check of logic by its kind, so its branches go untested.

#### Examples

```pseudo title="Avoid"
# carts/presentation/bindings/queries/show-cart.messages
function cartTitle(width)
  return width < narrowWidth ? "Cart" : "Shopping cart"
```

```pseudo title="Prefer"
# carts/presentation/bindings/queries/show-cart.messages
let cartTitleShort = "Cart"
let cartTitleLong = "Shopping cart"

# carts/presentation/bindings/queries/show-cart
let title = width < narrowWidth ? messages.cartTitleShort : messages.cartTitleLong
```

### ambiguous-messages-carry-context · SHOULD

Every short or ambiguous catalogue message carries a comment or a context for its translator.

#### Why

"Open" is a verb or an adjective; a translator who cannot see the screen guesses.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/queries/show-order.messages
let open = "Open"
```

```pseudo title="Prefer"
# orders/presentation/bindings/queries/show-order.messages
let openOrder = message("Open", { context: "button: opens the order's page" })
let orderIsOpen = message("Open", { context: "status: the order is not yet paid" })
```

### catalogue-apostrophe-never-escapes-a-parameter · MUST

No straight apostrophe in a catalogue message turns the parameter after it into text.

#### Why

A format that reads a straight apostrophe before a brace as the start of an escape shows the parameter after it as text, so a translator's ordinary apostrophe breaks the catalogue message in that one language.

#### Examples

```text title="Avoid"
locales/fr catalogue
addedToList = "Ajouté à l'{listName}"
              shown: Ajouté à l{listName}
```

```text title="Prefer"
locales/fr catalogue
addedToList = "Ajouté à l’{listName}"
              shown: Ajouté à l’Anniversaire
```

## Development

### pseudo-locale-runs-in-development · SHOULD

Every program with a catalogue offers a pseudo-locale in development, accented and longer than its source and optionally right to left.

#### Why

Without it, text written outside the catalogue, text cut by its box and sentences built by joining reach the first real translation unseen.

#### Examples

```text title="Avoid"
locales in development
  en       Shopping cart
  uk       Кошик
```

```text title="Prefer"
locales in development
  en       Shopping cart
  uk       Кошик
  en-XA    [Šĥöƥƥîñĝ ċåŕţ one two]
  ar-XB    right to left, mirrored
```
