```pseudo title="Avoid"
function createOrder(customer, lines)   # an act of the business
function validateEmail(text)            # keeps nothing it learned
function parentOf(path)                 # "Of" for a derived value
function makeGetPage(pages)             # a third word for building
```

```pseudo title="Prefer"
function placeOrder(input)              # the glossary's verb
function parseEmail(text)               # may fail, naming every problem
function OrderId.create(text)           # the checked constructor
function createGetPage(pages)           # a factory builds a unit
function toFailureReport(failure)       # a conversion that cannot fail
Path.parent(path)                       # a derived value is a noun
function onSubmit(event)                # a callback named for its event
function handleEvent(event)             # the name an implemented contract imposes
```
