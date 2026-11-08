# Integrations

> Governs a change a screen shows before the remote system confirms it, writes that overlap, forms whose input travels to another system, and the specs that stand in for it.

## Writes

### optimistic-change-rolled-back-on-refusal · MUST

Every change a screen shows before the remote system confirms it is rolled back if the system refuses it. Exempt: data of a stream folded in as it arrives, which is no such change.

#### Why

An optimistic change without a rollback leaves the screen showing what the remote system refused.

#### Examples

```pseudo title="Avoid"
function onRename(project, name)
  setProjects(projects => renamed(projects, project.id, name))

  call renameProject(project.id, name)  # a refusal leaves the new name shown
```

```pseudo title="Prefer"
function onRename(project, name)
  let write = pending.add(project.id, { name })

  try
    call renameProject(project.id, name)
    pending.confirm(write)
  catch refusal
    pending.drop(write)
    showError(refusal)
```

### overlapping-writes-keep-each-others-results · MUST

No write that overlaps another undoes its result: the rollback of one leaves every other unconfirmed write's change shown.

#### Why

A rollback that also undoes the other unconfirmed writes drops changes that still stand, and the screen shows neither what the user did nor what the system holds.

#### Examples

```pseudo title="Avoid"
function onToggleDone(task)
  let before = tasks
  setTasks(withDone(tasks, task.id, not task.isDone))

  try
    call updateTask(task.id, { isDone: not task.isDone })
  catch refusal
    setTasks(before)  # also undoes every other unconfirmed toggle
```

```pseudo title="Prefer"
function onToggleDone(task)
  let write = pending.add(task.id, { isDone: not task.isDone })

  try
    call updateTask(task.id, { isDone: not task.isDone })
    pending.confirm(write)
  catch refusal
    pending.drop(write)
    showError(refusal)

let shownTasks = applyPending(confirmedTasks, pending.all())
```

### in-flight-read-never-overwrites-a-pending-change · MUST

No read already in flight overwrites a change a screen shows ahead of the remote system's confirmation.

#### Why

A late read erases a change already shown, and the screen shows neither what the user did nor what the system holds.

#### Examples

```pseudo title="Avoid"
function onTasksLoaded(tasks)
  setShownTasks(tasks)  # a read sent before the toggle erases it
```

```pseudo title="Prefer"
function onTasksLoaded(tasks)
  setConfirmedTasks(tasks)

let shownTasks = applyPending(confirmedTasks, pending.all())
```

### pending-item-shown-from-its-input · SHOULD

Every item a person creates through a remote system is shown from the write's input until the system answers the write.

#### Why

An item shown only once the remote system answers leaves the person's action looking lost until then, and the person may make it again.

#### Examples

```pseudo title="Avoid"
function onAddComment(text)
  let comment = postComment({ text })

  setComments(comments => [...comments, comment])
```

```pseudo title="Prefer"
function onAddComment(text)
  let write = pending.add(createLocalId(), { text, author: currentUser, isPending: true })

  try
    let comment = postComment({ text })
    pending.confirm(write, comment)
  catch refusal
    pending.drop(write)
    showError(refusal)
```

### pending-item-keeps-its-place · SHOULD

Every item a screen shows while it waits for the identifier the remote system assigns keeps its place when that identifier arrives.

#### Why

An item that jumps when the remote system names it reads as a new item, and the person loses sight of the one they made.

#### Examples

```pseudo title="Avoid"
List(
  items: shownComments,
  key: function(comment) comment.id,  # changes when the server names it
  renderItem: CommentRow
)
```

```pseudo title="Prefer"
List(
  items: shownComments,
  key: function(comment) comment.localId,
  renderItem: CommentRow
)
```

## Input

### input-driven-requests-debounced · SHOULD

Every request driven by typing is sent once the typing pauses, for a pause the project sets, never on every keystroke.

#### Why

A request per keystroke floods the remote system and shows results for words the user is still typing.

#### Examples

```pseudo title="Avoid"
SearchField(
  label: "Search products",
  onChange: function(query) searchProducts(query)
)
```

```pseudo title="Prefer"
let searchAfterPause = debounce(searchProducts, SEARCH_TYPING_PAUSE)

SearchField(
  label: "Search products",
  onChange: searchAfterPause
)
```

### remote-field-error-shown-on-its-field · SHOULD

Every field error the remote system returns is shown on the field it names.

#### Why

An error shown away from its field leaves the user searching the form for what the remote system refused.

#### Examples

```pseudo title="Avoid"
function onSaveRefused(refusal, form)
  when refusal
    is InvalidInput then showToast(refusal.message)
```

```pseudo title="Prefer"
function onSaveRefused(refusal, form)
  when refusal
    is InvalidInput then
      for problem in refusal.problems
        form.setFieldError(problem.field, problem.message)
```

### user-input-survives-connection-loss · MUST

All input the person entered survives a request that times out or loses its connection. It can be sent again without being typed again.

#### Why

A person whose input a dropped connection erases must type it again, and many give up instead.

#### Examples

```pseudo title="Avoid"
function onSubmit(form)
  let values = form.values
  form.reset()

  call sendMessage(values)  # a dropped connection loses what was typed
```

```pseudo title="Prefer"
function onSubmit(form)
  try
    call sendMessage(form.values)
    form.reset()
  catch failure
    when failure
      is Timeout, ConnectionLost then showRetry(function() onSubmit(form))
      else throw failure
```

## Specs

### screen-spec-replaces-only-the-transport → effect-faked-never-mocked · SHOULD

Every screen's spec runs the real code down to the remote transport, and replaces only the remote transport, with captured responses. So does the spec of what reads or writes the screen's data. Exempt: the spec of a screen that shows nothing the remote system gives, which may fake a business operation.

#### Why

A spec over a faked operation skips the data bindings, the code that talks to the remote system and the mapping, so a response the mapping gets wrong passes it.

#### Examples

```pseudo title="Avoid"
test "should show the orders when they load"
  # Arrange
  let getOrders = fakeFunction(returns: [createOrder({ number: "A-17" })])

  # Act
  let screen = render(OrdersScreen(), { getOrders })

  # Assert
  assert screen.findByText("A-17") is not <absent>
```

```pseudo title="Prefer"
test "should show the orders when they load"
  # Arrange
  let transport = createRecordedTransport({ "GET /orders": "orders-list.response" })

  # Act
  let screen = render(OrdersScreen(), { transport })

  # Assert
  assert screen.findByText("A-17") is not <absent>
```
