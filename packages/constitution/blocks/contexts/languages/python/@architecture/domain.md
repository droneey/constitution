# Domain

> Governs the domain model in Python: where an aggregate, an entity or a value object answers what it is asked, and how it is built and changed by its transitions.

## Aggregates

### aggregate-changed-by-replace-in-its-transitions → aggregate-changed-only-by-its-transitions · MUST

Every aggregate is built and changed only by the functions of its concept's `transitions/`, never by its methods. Each move returns a new value, made by `dataclasses.replace` within its stage or by the constructor of the stage it moves to. The starting transition calls the aggregate's constructor, its first stage's where it has stages, and no other code calls `replace` or a constructor of the aggregate. Exempt: its rebuild from storage, a function of the module that declares the aggregate, which also calls the constructors.

#### Why

Python cannot keep a constructor private, so an aggregate built or changed outside its transitions skips the checks they make, and only a folder of their own lets the imports keep the presentation and the adapters from the transitions, while a value made by `replace` or by a stage's constructor runs `__post_init__` again, so its invariants hold after every transition.

#### Examples

```py title="Avoid"
# src/shop/features/orders/domain/order/entities/order_aggregate.py
@dataclass(frozen=True, slots=True, kw_only=True)
class DraftOrder:
    id: OrderId
    delivery_address: Address
    version: int

    def with_address(self, address: Address) -> DraftOrder:
        return replace(self, delivery_address=address, version=self.version + 1)
```

```py title="Prefer"
# src/shop/features/orders/domain/order/transitions/order_transitions.py
def change_delivery_address(order: DraftOrder, address: Address) -> DraftOrder:
    return replace(order, delivery_address=address, version=order.version + 1)
```

### rule-of-one-thing-is-a-method-of-its-dataclass → rule-of-one-thing-lives-beside-its-data · SHOULD

Every rule of one thing is a method or a property of that thing's dataclass, in its file. It is a predicate or a derived value of an aggregate, an entity or a value object, or a value object's operation, such as the sum of two amounts; an enumeration's are methods or properties of its `enum` class.

#### Why

A predicate, a derived value or an operation kept away from its dataclass is not found where Python's readers look for it, on the type, and is written again by each caller that needs it.

#### Examples

```py title="Avoid"
# src/shop/features/carts/domain/cart/services/cart_total_service.py
def cart_total(cart: Cart) -> Decimal:
    return sum((line.subtotal for line in cart.lines), Decimal(0))
```

```py title="Prefer"
# src/shop/features/carts/domain/cart/entities/cart_aggregate.py
@dataclass(frozen=True, slots=True, kw_only=True)
class Cart:
    id: CartId
    lines: tuple[CartLine, ...]

    @property
    def total(self) -> Decimal:
        return sum((line.subtotal for line in self.lines), Decimal(0))
```
