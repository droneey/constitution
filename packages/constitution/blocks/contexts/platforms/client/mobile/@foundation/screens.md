# Screens

> Governs the screens of an app on a phone or tablet as the system shapes them: the system's lifecycle, its back gesture and the parts of the screen it lays over the app.

## Lifecycle

### state-survives-the-os-lifecycle · MUST

Every piece of input and view state survives the system's lifecycle. Going to the background, being suspended and being ended by the system lose none of it. Exempt: a secret typed into a field.

#### Why

The system ends apps without asking, and a user who comes back to find what they left gone has lost their work.

#### Examples

```kotlin title="Avoid"
@Composable
fun DeliveryNoteField() {
    var note by remember { mutableStateOf("") }   // lost when the system ends the app

    TextField(value = note, onValueChange = { note = it }, label = { Text(stringResource(R.string.delivery_note)) })
}
```

```kotlin title="Prefer"
@Composable
fun DeliveryNoteField() {
    var note by rememberSaveable { mutableStateOf("") }

    TextField(value = note, onValueChange = { note = it }, label = { Text(stringResource(R.string.delivery_note)) })
}
```

## Navigation

### back-gesture-goes-back · SHOULD

Every use of the system's back gesture or back button goes back, and no gesture of the app's own competes with it.

#### Why

Back is the gesture users trust most, and one that does something else loses them.

#### Examples

```kotlin title="Avoid"
@Composable
fun OrdersScreen(viewModel: OrdersViewModel) {
    BackHandler { viewModel.refresh() }   // back reloads the list instead of going back

    OrderList(viewModel.orders)
}
```

```kotlin title="Prefer"
@Composable
fun OrdersScreen(viewModel: OrdersViewModel) {
    val isFilterOpen by viewModel.isFilterOpen.collectAsStateWithLifecycle()

    BackHandler(enabled = isFilterOpen) { viewModel.closeFilter() }

    OrderList(viewModel.orders)
}
```

## System overlays

### content-kept-inside-the-safe-areas · MUST

No text or control, the content a person reads or operates, sits outside the screen's safe areas.

#### Why

Outside them, the notch, the rounded corners and the system bars hide what is there.

#### Examples

```swift title="Avoid"
struct CheckoutView: View {
    let pay: () -> Void

    var body: some View {
        VStack {
            CartSummary()
            Spacer()
            Button("Pay", action: pay)
        }
        .ignoresSafeArea()   // the home indicator covers the button
    }
}
```

```swift title="Prefer"
struct CheckoutView: View {
    let pay: () -> Void

    var body: some View {
        VStack {
            CartSummary()
            Spacer()
            Button("Pay", action: pay)
        }
        .background(Color("Surface").ignoresSafeArea())
    }
}
```

### focused-field-kept-above-the-keyboard · MUST

While the on-screen keyboard is shown, every focused field and its action stay above it.

#### Why

A user who cannot see what they type, or the button that sends it, is stuck.

#### Examples

```kotlin title="Avoid"
@Composable
fun MessageComposer(draft: String, onDraftChange: (String) -> Unit, onSend: () -> Unit) {
    Row(Modifier.fillMaxWidth()) {   // the keyboard covers the field and its send button
        TextField(value = draft, onValueChange = onDraftChange, modifier = Modifier.weight(1f))
        Button(onClick = onSend) { Text(stringResource(R.string.send)) }
    }
}
```

```kotlin title="Prefer"
@Composable
fun MessageComposer(draft: String, onDraftChange: (String) -> Unit, onSend: () -> Unit) {
    Row(Modifier.fillMaxWidth().imePadding()) {
        TextField(value = draft, onValueChange = onDraftChange, modifier = Modifier.weight(1f))
        Button(onClick = onSend) { Text(stringResource(R.string.send)) }
    }
}
```
