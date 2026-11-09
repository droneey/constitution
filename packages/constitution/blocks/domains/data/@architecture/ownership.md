# Ownership

> Governs who reads and writes a feature's stored records, and where they live in the store.

## General

### feature-owns-its-stored-records · SHOULD

Every feature's stored records are read and written only by its own adapter modules, with their edge workers. Another feature reaches them only through the owner's operations, composed in composition, never by a read of the owner's store, a join or a view over its records.

#### Why

A read of another feature's records couples the two through the store, where no import rule sees it, and the owner can no longer change its schema alone.

#### Examples

```pseudo title="Avoid"
# invoices/infrastructure/database/invoice-queries.adapter
listWithOrders: function(customerId, context)
  return client.findAll(
    join(InvoiceSchema, OrderSchema, { on: "orderId" }),  # reads the orders feature's records
    { customerId },
    { signal: context.signal })
```

```pseudo title="Prefer"
# composition/customer-statement/application/use-cases/queries/get-statement.use-case
function createGetStatement({ listInvoices, listOrders })
  return function(input, context)
    let invoices = await listInvoices({ customerId: input.customerId }, context)
    let orders = await listOrders({ customerId: input.customerId }, context)

    return toStatement(invoices, orders)
```

### feature-records-in-a-namespace-of-their-own · SHOULD

Every feature's records live in a schema or namespace of their own. Exempt: a store that has neither, where they live under a name prefix of their own.

#### Why

Records that share a namespace with another feature's cannot be told apart by name, so a reader cannot say which feature owns a record, and no grant of the store can keep one feature's code from the other's records.

#### Examples

```text title="Avoid"
shop store
├── orders
├── order_lines
├── invoices
└── invoice_lines
```

```text title="Prefer"
shop store
├── orders/
│   ├── orders
│   └── order_lines
└── invoices/
    ├── invoices
    └── invoice_lines
```

### feature-namespace-reached-by-its-own-credential → credential-has-least-privilege · MUST

Where the store grants access by namespace, every feature's records are reached by a credential granted that feature's namespace alone.

#### Why

A credential granted every feature's namespace lets a read across features go through unrefused, so the store holds no line that the import rules draw — least privilege.

#### Examples

```text title="Avoid"
credential shop_app
  granted   orders, invoices
  used by   the orders and invoices adapters
```

```text title="Prefer"
credential orders_app
  granted   orders
  used by   the orders adapters

credential invoices_app
  granted   invoices
  used by   the invoices adapters
```
