# Ports

> Governs a port at a boundary in TypeScript and its adapter: how a port is declared and how an adapter maps null.

## Declarations

### port-is-an-interface → behaviour-composed-not-inherited · SHOULD

In a typed file, every port is an `interface`, or a type of functions, holding no implementation.

#### Why

A port that holds an implementation, or a base class its adapter extends, ties the adapter to the inner layer's code, so neither the adapter nor a fake can change without touching the code that depends on the port — the dependency inversion principle.

#### Examples

```ts title="Avoid"
// src/features/invoices/application/contracts/mailer.port.ts
export abstract class MailerPort {
  abstract send(mail: Mail, context: Context): Promise<void>;

  async sendAll(mails: readonly Mail[], context: Context): Promise<void> {
    for (const mail of mails) {
      await this.send(mail, context);
    }
  }
}
```

```ts title="Prefer"
// src/features/invoices/application/contracts/mailer.port.ts
export interface MailerPort {
  send(mail: Mail, context: Context): Promise<void>;
}
```

## Adapters

### null-mapped-to-undefined-in-the-adapter → outside-shape-mapped-in-the-adapter · MUST

Every `null` of an outside format stays in the wire models and their adapters. The adapters that read and write those models map it to and from `undefined`.

#### Why

A `null` that travels inward brings a second absence into code that checks only for `undefined`.

#### Examples

```ts title="Avoid"
// src/features/customers/infrastructure/http/customer-api.adapter.ts
const toCustomer = (dto: CustomerDto): Customer =>
  restoreCustomer({
    id: CustomerId.create(dto.id),
    phone: dto.phone === null ? null : PhoneNumber.create(dto.phone),
  });
```

```ts title="Prefer"
// src/features/customers/infrastructure/http/customer-api.adapter.ts
const toCustomer = (dto: CustomerDto): Customer =>
  restoreCustomer({
    id: CustomerId.create(dto.id),
    ...(dto.phone === null ? {} : { phone: PhoneNumber.create(dto.phone) }),
  });
```
