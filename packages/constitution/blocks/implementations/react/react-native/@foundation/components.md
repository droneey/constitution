# Components

> Governs the lists of native components.

## General

### list-never-mapped-in-a-scroll-view → long-lists-virtualised · SHOULD

No list that can grow is mapped inside a `ScrollView`.

#### Why

A `ScrollView` mounts every child at once, so a mapped list in it renders every row however long it grows.

#### Examples

```tsx title="Avoid"
<ScrollView>
  {orders.map((order) => (
    <OrderRow key={order.id} order={order} />
  ))}
</ScrollView>
```

```tsx title="Prefer"
<FlatList
  data={orders}
  keyExtractor={(order) => order.id}
  renderItem={({ item }) => <OrderRow order={item} />}
/>
```
