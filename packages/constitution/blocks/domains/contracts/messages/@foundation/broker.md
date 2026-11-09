# Broker

> Governs the program's rights on the message broker.

## Rights

### broker-rights-scoped-to-own-channels → credential-has-least-privilege · MUST

Every program's credential for the message broker writes only the message channels it publishes to and reads only those it consumes.

#### Why

A credential that reaches every message channel lets one compromised program read every message and forge any other's — least privilege.

#### Examples

```text title="Avoid"
shipping-service
  write:  *
  read:   *
```

```text title="Prefer"
shipping-service
  write:  shipping.shipment-dispatched
  read:   orders.order-paid
```
