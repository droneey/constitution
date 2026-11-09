# Names

> Governs a name in Python: its case, the mark of a name kept to its module, a class's name, a named constant and the spelling of a function's kind.

## Meaning

### named-constant-annotated-final · SHOULD

Every named constant is annotated `Final`.

#### Why

The case only asks a reader not to rebind the name, so without `Final` a rebinding passes the type check and changes the constant for every reader of the module.

#### Examples

```py title="Avoid"
MAX_CART_LINES = 100  # a rebinding passes the type check
```

```py title="Prefer"
from typing import Final

MAX_CART_LINES: Final = 100
```

## Form

### names-cased-as-pep-8 → name-case-by-kind · MUST

Each kind of name takes its PEP 8 case. A class, a type alias, a type parameter and an exception are PascalCase; a function, a method, a variable and a parameter are snake_case; and a module-level constant and an enumeration's member are UPPER_SNAKE_CASE.

#### Why

Every Python reader and library follows these cases, so a name cased otherwise is taken for another kind, a class for a function or a constant for a variable, until its declaration is read — PEP 8.

#### Examples

```py title="Avoid"
maxCartLines: Final = 100


@unique
class order_status(StrEnum):
    Draft = "draft"
    Paid = "paid"


def CartTotal(cartLines: Sequence[CartLine]) -> Decimal:
    return sum((line.subtotal for line in cartLines), Decimal(0))
```

```py title="Prefer"
MAX_CART_LINES: Final = 100


@unique
class OrderStatus(StrEnum):
    DRAFT = "draft"
    PAID = "paid"


def cart_total(cart_lines: Sequence[CartLine]) -> Decimal:
    return sum((line.subtotal for line in cart_lines), Decimal(0))
```

### internal-name-opens-with-one-underscore · SHOULD

Every name kept to its module or its class opens with a single underscore.

#### Why

A leading underscore is the one mark Python's readers, its tools and `from <module> import *` read as kept to its module or class, so an internal name without it is taken for part of what the module offers and called from outside, where a change to it breaks the caller.

#### Examples

```py title="Avoid"
# orders/pricing.py
TAX_RATE: Final = Decimal("0.23")


def round_to_cents(amount: Decimal) -> Decimal:  # kept to the module, unmarked
    return amount.quantize(Decimal("0.01"))


def price_with_tax(net: Decimal) -> Decimal:
    return round_to_cents(net * (1 + TAX_RATE))
```

```py title="Prefer"
# orders/pricing.py
_TAX_RATE: Final = Decimal("0.23")


def _round_to_cents(amount: Decimal) -> Decimal:
    return amount.quantize(Decimal("0.01"))


def price_with_tax(net: Decimal) -> Decimal:
    return _round_to_cents(net * (1 + _TAX_RATE))
```

### class-name-carries-no-protocol-or-abc-mark → type-name-undecorated · MUST

No class's name carries a mark of its construct. Such marks include an `I` prefix, a `Protocol`, `Interface`, `ABC` or `Type` suffix, and on a `Protocol` or an `ABC` an `Abstract` or `Base` prefix.

#### Why

The mark repeats what the class's bases already show, lengthens the name at every use and turns false when the class stops being a `Protocol` or an `ABC`, while the standard library's own, as `Iterable` and `Mapping`, carry none.

#### Examples

```py title="Avoid"
class IPaymentGateway(Protocol):
    async def charge(self, order_id: OrderId, amount: Money) -> PaymentId: ...


class OrderRepositoryProtocol(Protocol):
    async def get(self, order_id: OrderId) -> Order: ...
```

```py title="Prefer"
class PaymentGatewayPort(Protocol):
    async def charge(self, order_id: OrderId, amount: Money) -> PaymentId: ...


class OrderRepositoryPort(Protocol):
    async def get(self, order_id: OrderId) -> Order: ...
```

### function-kinds-spelled-on-their-class → function-kind-spelled-on-its-type · SHOULD

Every function `function-kind-spelled-on-its-type` spells on a class takes the class's form. A parse or a conversion into it is a classmethod, and a derived value of it a property; one of a type that is no class of the program's own, such as a `NewType`, is a snake_case module function.

#### Why

A parse or a conversion kept apart from its class is not found where the standard library's readers look for an alternate constructor, and a derived value written as a method reads as an act.

#### Examples

```py title="Avoid"
@dataclass(frozen=True, slots=True, kw_only=True)
class Money:
    amount: Decimal
    currency: Currency

    def in_minor_units(self) -> int:
        return int(self.amount * 100)


def parse_money(text: str) -> Money:
    amount, currency = text.split(" ")
    return Money(amount=Decimal(amount), currency=Currency(currency))
```

```py title="Prefer"
@dataclass(frozen=True, slots=True, kw_only=True)
class Money:
    amount: Decimal
    currency: Currency

    @classmethod
    def parse(cls, text: str) -> Self:
        amount, currency = text.split(" ")
        return cls(amount=Decimal(amount), currency=Currency(currency))

    @property
    def minor_units(self) -> int:
        return int(self.amount * 100)
```
