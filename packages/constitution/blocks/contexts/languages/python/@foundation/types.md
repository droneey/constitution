# Types

> Governs how Python types the program: absence, unchecked types, narrowing, enumerations and new types, generics, frozen values, and the values of time, money and paths.

## Vocabulary

Absence is spelled **`None`**{#absent}, and a value with an invariant is built by its class called as **`<Type>(<value>)`**{#checked-constructor}, its checked constructor.

## General

### generics-in-pep-695-form · MUST

Every generic declares its type parameters in its own header. This holds for a class, a function and a type alias, and none declares them through `TypeVar`, `Generic` or `TypeAlias`.

#### Why

A type parameter declared through `TypeVar` sits at module level, apart from the generic that uses it, where a reader must look up its bound and its variance and any other declaration of the module can reach it, while every Python this block supports has the header form — PEP 695.

#### Examples

```py title="Avoid"
T = TypeVar("T")


@dataclass(frozen=True, slots=True, kw_only=True)
class Page(Generic[T]):
    items: tuple[T, ...]
    next_cursor: Cursor | None
```

```py title="Prefer"
@dataclass(frozen=True, slots=True, kw_only=True)
class Page[T]:
    items: tuple[T, ...]
    next_cursor: Cursor | None
```

### annotation-written-unquoted · MUST

Wherever the code's `requires-python` floor is 3.14 or later, every annotation is written unquoted. No module then imports `from __future__ import annotations`.

#### Why

A quoted annotation, or the future import, turns annotations into strings that code reading them at run time, such as a parser or a framework's injection, cannot always resolve, while from 3.14 the language evaluates them lazily by itself.

#### Examples

```py title="Avoid"
@dataclass(frozen=True, slots=True, kw_only=True)
class Order:
    id: OrderId
    lines: tuple["OrderLine", ...]  # quoted, though requires-python is >=3.14


@dataclass(frozen=True, slots=True, kw_only=True)
class OrderLine:
    product_id: ProductId
    quantity: int
```

```py title="Prefer"
@dataclass(frozen=True, slots=True, kw_only=True)
class Order:
    id: OrderId
    lines: tuple[OrderLine, ...]


@dataclass(frozen=True, slots=True, kw_only=True)
class OrderLine:
    product_id: ProductId
    quantity: int
```

## Modelling

### staged-value-is-a-union-of-dataclasses → illegal-state-unrepresentable · MUST

Every value with distinct stages is a union of dataclasses, one per stage. Each holds only its stage's fields.

#### Why

One class for every stage carries fields that most stages leave empty, so code reads a field its stage never set, while a class per stage gives each branch on it only the fields its stage has — make illegal states unrepresentable.

#### Examples

```py title="Avoid"
@dataclass(frozen=True, slots=True, kw_only=True)
class Order:
    id: OrderId
    status: OrderStatus
    paid_at: datetime | None
    tracking_number: TrackingNumber | None
```

```py title="Prefer"
@dataclass(frozen=True, slots=True, kw_only=True)
class DraftOrder:
    id: OrderId


@dataclass(frozen=True, slots=True, kw_only=True)
class PaidOrder:
    id: OrderId
    paid_at: datetime


@dataclass(frozen=True, slots=True, kw_only=True)
class ShippedOrder:
    id: OrderId
    paid_at: datetime
    tracking_number: TrackingNumber


type Order = DraftOrder | PaidOrder | ShippedOrder
```

### closed-set-match-ends-in-assert-never → closed-set-branched-exhaustively · MUST

Every branch over a closed set ends in `assert_never`. A `match` or an `if` chain over an enumeration, a union of classes or a union of literals names every member in a branch and ends in `assert_never(value)`, with no other default branch.

#### Why

`assert_never` fails the type check wherever a member added to the set is not handled, and raises if one arrives at run time.

#### Examples

```py title="Avoid"
def can_cancel(order: Order) -> bool:
    match order:
        case DraftOrder() | PaidOrder():
            return True
        case _:
            return False
```

```py title="Prefer"
def can_cancel(order: Order) -> bool:
    match order:
        case DraftOrder() | PaidOrder():
            return True
        case ShippedOrder():
            return False
        case _:
            assert_never(order)
```

### outside-number-set-is-an-int-enum → outside-vocabulary-reached-through-a-total-table · MUST

Every set of numbers another system defines is an `enum.IntEnum` whose members hold those numbers, the keys of its total table. Such sets include exit statuses and HTTP statuses. The enumeration is the program's own or the standard library's, such as `http.HTTPStatus`.

#### Why

The numbers are fixed by the other system, so a string enumeration would hold a second spelling the other side never reads.

#### Examples

```py title="Avoid"
@unique
class DeclineCode(StrEnum):
    INSUFFICIENT_FUNDS = "insufficient-funds"  # the issuer sends 51
    CARD_EXPIRED = "card-expired"
```

```py title="Prefer"
@unique
class DeclineCode(IntEnum):
    INSUFFICIENT_FUNDS = 51
    CARD_EXPIRED = 54
```

### int-enum-member-number-never-left-to-auto → outside-code-written-out-on-its-member · MUST

No member of an `enum.IntEnum` of another system's numbers has its number left to `auto()`.

#### Why

A number left to `auto()` follows the member's place in the list, so a member added or moved drifts from the number the other system sends.

#### Examples

```py title="Avoid"
@unique
class DeclineCode(IntEnum):
    INSUFFICIENT_FUNDS = auto()
    CARD_EXPIRED = auto()
```

```py title="Prefer"
@unique
class DeclineCode(IntEnum):
    INSUFFICIENT_FUNDS = 51
    CARD_EXPIRED = 54
```

### outside-number-never-converted-by-its-enumeration → unknown-outside-value-mapped-to-its-own-member · MUST

No number another system sends is converted by calling its enumeration. It stays an `int` until the total table maps it.

#### Why

Calling the enumeration raises on the first number the other system adds, while a lookup in the table can map it to the program's member for the unknown.

#### Examples

```py title="Avoid"
_DECLINE_REASONS: Final[Mapping[DeclineCode, DeclineReason]] = {
    DeclineCode.INSUFFICIENT_FUNDS: DeclineReason.NO_FUNDS,
    DeclineCode.CARD_EXPIRED: DeclineReason.CARD_EXPIRED,
}


def decline_reason(code: int) -> DeclineReason:
    return _DECLINE_REASONS[DeclineCode(code)]  # raises on a code the issuer adds
```

```py title="Prefer"
_DECLINE_REASONS: Final[Mapping[int, DeclineReason]] = {
    DeclineCode.INSUFFICIENT_FUNDS: DeclineReason.NO_FUNDS,
    DeclineCode.CARD_EXPIRED: DeclineReason.CARD_EXPIRED,
}


def decline_reason(code: int) -> DeclineReason:
    return _DECLINE_REASONS.get(code, DeclineReason.UNKNOWN)
```

### identifier-is-a-new-type → identifier-branded-by-entity · SHOULD

Every identifier is a `NewType` over its primitive, named after what it identifies. Exempt: an identifier that keeps an invariant, such as a slug or a tenant's code, which `invariant-value-is-a-frozen-dataclass` governs.

#### Why

Two identifiers typed by one primitive are swapped unseen, while the type checker refuses one `NewType` where another is expected, at no cost at run time, where the value is the primitive itself.

#### Examples

```py title="Avoid"
def assign_courier(order_id: str, courier_id: str) -> Assignment:
    return Assignment(order_id=order_id, courier_id=courier_id)
```

```py title="Prefer"
OrderId = NewType("OrderId", str)
CourierId = NewType("CourierId", str)


def assign_courier(order_id: OrderId, courier_id: CourierId) -> Assignment:
    return Assignment(order_id=order_id, courier_id=courier_id)
```

### enumeration-is-a-unique-str-enum → closed-set-declared-as-one-enumeration · MUST

Every closed set of named values the program owns is an `enum.StrEnum` marked `@unique`. It is never a union of `Literal` strings. Exempt: the one-member enumeration of a sentinel, which `not-given-spelled-by-one-sentinel` governs.

#### Why

A second name for one value is an alias, not a member, so the set holds fewer members than it writes, and `@unique` refuses that second name.

#### Examples

```py title="Avoid"
type PaymentMethod = Literal["card", "transfer", "cash"]
```

```py title="Prefer"
@unique
class PaymentMethod(StrEnum):
    CARD = "card"
    TRANSFER = "transfer"
    CASH = "cash"
```

### str-enum-member-value-never-left-to-auto · MUST

No member of an `enum.StrEnum` the program owns has its value left to `auto()`. Each value is written out as the string the program stores and sends.

#### Why

A value written out survives a member's rename, which `auto()` would carry into every stored record and message.

#### Examples

```py title="Avoid"
@unique
class OrderStatus(StrEnum):
    DRAFT = auto()
    PAID = auto()
    SHIPPED = auto()
```

```py title="Prefer"
@unique
class OrderStatus(StrEnum):
    DRAFT = "draft"
    PAID = "paid"
    SHIPPED = "shipped"
```

### entity-value-or-event-is-a-frozen-dataclass → value-immutable-by-default · SHOULD

Every type of an entity, a value equal by its data or an event is an immutable dataclass. It is declared with `frozen=True, slots=True`, its sequences are tuples, and its maps are a `frozendict` where the `requires-python` floor is 3.15 or later, typed `Mapping` below it. Exempt: a value with an invariant that is equal by its data, which `invariant-value-is-a-frozen-dataclass` governs.

#### Why

A mutable dataclass lets any holder change the value under every other holder, one without slots can still be changed through its `__dict__`, and a `dict` behind `Mapping` makes the value unhashable where a `frozendict` keeps it hashable.

#### Examples

```py title="Avoid"
@dataclass(kw_only=True)
class OrderPlaced:
    order_id: OrderId
    line_ids: list[LineId]
    placed_at: datetime
```

```py title="Prefer"
@dataclass(frozen=True, slots=True, kw_only=True)
class OrderPlaced:
    order_id: OrderId
    line_ids: tuple[LineId, ...]
    placed_at: datetime
```

### entity-value-or-event-dataclass-declared-kw-only → parts-of-one-whole-passed-by-name · SHOULD

Every dataclass of an entity, a value equal by its data or an event is declared `kw_only=True`.

#### Why

A field set by position is swapped unseen with another of its type, and a field added between two others shifts every call that builds the value.

#### Examples

```py title="Avoid"
@dataclass(frozen=True, slots=True)
class Shipment:
    order_id: OrderId
    origin: Address
    destination: Address


Shipment(order_id, customer_address, warehouse_address)  # swapped, unseen
```

```py title="Prefer"
@dataclass(frozen=True, slots=True, kw_only=True)
class Shipment:
    order_id: OrderId
    origin: Address
    destination: Address


Shipment(order_id=order_id, origin=warehouse_address, destination=customer_address)
```

### received-collection-typed-read-only → value-immutable-by-default · SHOULD

Every collection parameter or field the code only reads is typed read-only. It takes a type such as `Sequence`, `Mapping`, `AbstractSet` or `tuple`, never `list`, `dict` or `set`.

#### Why

A collection typed `list` or `dict` lets the code that receives it sort it or add to it in place unseen, while a read-only type makes the type checker refuse every such change.

#### Examples

```py title="Avoid"
def order_total(lines: list[OrderLine]) -> Decimal:
    return sum((line.subtotal for line in lines), Decimal(0))
```

```py title="Prefer"
def order_total(lines: Sequence[OrderLine]) -> Decimal:
    return sum((line.subtotal for line in lines), Decimal(0))
```

### collection-with-another-holder-changed-by-sorted-or-unpacking → value-immutable-by-default · MUST

Every collection with another holder, one the code received or handed on, is changed only into a new value. The new value is made by `sorted()`, `[*items, item]` or `{**mapping, key: value}`, never by `sort`, `append` or an assignment to an index or a key of that collection.

#### Why

A collection changed in place changes under its caller, so a sort made for one use reorders the data the caller still holds and reads.

#### Examples

```py title="Avoid"
def lines_by_price(lines: list[OrderLine]) -> list[OrderLine]:
    lines.sort(key=lambda line: line.unit_price)  # reorders the caller's list
    return lines
```

```py title="Prefer"
def lines_by_price(lines: Sequence[OrderLine]) -> list[OrderLine]:
    return sorted(lines, key=lambda line: line.unit_price)
```

## Type checking

### typing-any-never-written → unchecked-type-never-used · MUST

No code writes `Any`. It appears in no annotation and in no generic's arguments, such as `dict[str, Any]`, and no parameter, return or generic argument is left unannotated, which reads as `Any`.

#### Why

`Any` passes every check in both directions, so one unannotated parameter spreads unchecked values into every caller and callee.

#### Examples

```py title="Avoid"
def receipt_payload(order: PaidOrder) -> dict[str, Any]:
    return {
        "order_id": order.id,
        "total": str(order.total),
        "line_count": len(order.lines),
    }
```

```py title="Prefer"
class ReceiptPayload(TypedDict):
    order_id: str
    total: str
    line_count: int


def receipt_payload(order: PaidOrder) -> ReceiptPayload:
    return {
        "order_id": order.id,
        "total": str(order.total),
        "line_count": len(order.lines),
    }
```

### typing-cast-never-written → narrowing-proves-all-it-claims · MUST

No `typing.cast` is written.

#### Why

A cast claims a type no check proved and the type checker believes it, so the failure surfaces later, far from the line that claimed it.

#### Examples

```py title="Avoid"
def paid_order(order: Order) -> PaidOrder:
    return cast(PaidOrder, order)
```

```py title="Prefer"
def paid_order(order: Order) -> PaidOrder:
    if not isinstance(order, PaidOrder):
        raise OrderNotPaidError(order.id)
    return order
```

### narrowing-function-returns-typeis → narrowing-proves-all-it-claims · MUST

Every function that narrows its argument returns `TypeIs[T]`, never `TypeGuard[T]`. Exempt: a `T` that is no subtype of the argument's type, for which it returns `TypeGuard[T]`.

#### Why

`TypeIs` narrows the false branch by the same check, while `TypeGuard` narrows only the true one and lets a function claim a type unrelated to what it was given.

#### Examples

```py title="Avoid"
def is_shipped(order: Order) -> TypeGuard[ShippedOrder]:
    return isinstance(order, ShippedOrder)
```

```py title="Prefer"
def is_shipped(order: Order) -> TypeIs[ShippedOrder]:
    return isinstance(order, ShippedOrder)
```

## Invariants

### invariant-value-is-a-frozen-dataclass → invariant-value-is-plain-immutable-data · MUST

Every value with an invariant that is equal by its data is an immutable dataclass of immutable fields. It is declared with `frozen=True, slots=True` and is never a `NamedTuple` or a parsing library's model. Each field is immutable, such as a `str`, an `int`, a `Decimal`, a `tuple`, a `frozenset` or another such value, and a map is a `frozendict` where the `requires-python` floor is 3.15 or later and a tuple of its key-value pairs below it.

#### Why

The generated `__eq__` and `__hash__` then compare and hash it by its data, while a `dict` field, even behind `Mapping`, changes under the check and leaves it unhashable, a `NamedTuple` equals any tuple of the same items and a parsing library's model carries the library's behaviour beside the data.

#### Examples

```py title="Avoid"
@dataclass(frozen=True, slots=True, kw_only=True)
class DeliveryDays:
    days: list[Weekday]  # changes under the check and leaves the value unhashable

    def __post_init__(self) -> None:
        if not self.days:
            raise NoDeliveryDayError()
```

```py title="Prefer"
@dataclass(frozen=True, slots=True, kw_only=True)
class DeliveryDays:
    days: frozenset[Weekday]

    def __post_init__(self) -> None:
        if not self.days:
            raise NoDeliveryDayError()
```

### invariant-checked-in-post-init → invariant-checked-at-construction · MUST

Every dataclass that keeps an invariant checks it in `__post_init__`, so its class is its own checked constructor.

#### Why

A check kept in a function of its own is skipped by every other way of building the value (the constructor, `replace`, a parser) while each of them passes through `__post_init__` — parse, don't validate.

#### Examples

```py title="Avoid"
@dataclass(frozen=True, slots=True, kw_only=True)
class Quantity:
    value: int


def make_quantity(value: int) -> Quantity:
    if value <= 0:
        raise NonPositiveQuantityError(value)
    return Quantity(value=value)
```

```py title="Prefer"
@dataclass(frozen=True, slots=True, kw_only=True)
class Quantity:
    value: int

    def __post_init__(self) -> None:
        if self.value <= 0:
            raise NonPositiveQuantityError(self.value)
```

## Values from outside

### outside-value-typed-object-until-parsed → outside-value-untyped-until-parsed · MUST

Every value from outside the program is typed `object` until it is parsed or narrowed. This includes `json.loads`'s result; a schema parses it, and `isinstance` and `in` checks narrow it.

#### Why

A value from outside typed `Any`, or by a type nobody checked, is used unchecked and breaks on its first unexpected field far from where it entered, while the type checker refuses every use of an `object` value until a check narrows it — parse, don't validate.

#### Examples

```py title="Avoid"
def parse_payment_event(body: bytes) -> PaymentEvent:
    payload = json.loads(body)  # Any, used unchecked
    return PaymentEvent(
        payment_id=PaymentId(payload["id"]),
        status=PaymentStatus(payload["status"]),
    )
```

```py title="Prefer"
_PAYMENT_EVENT: Final = TypeAdapter(PaymentEvent)


def parse_payment_event(body: bytes) -> PaymentEvent:
    payload: object = json.loads(body)
    return _PAYMENT_EVENT.validate_python(payload)
```

## Kinds of value

### absence-spelled-none → absence-spelled-by-one-value · MUST

Every absent value is `None`, typed `T | None`. Exempt: another spelling that an outside format or an API the code calls imposes, and a “not given” where `None` is itself a value, which `not-given-spelled-by-one-sentinel` governs.

#### Why

A second spelling of absence, such as an empty string or a `-1`, needs a second check, which some code forgets, while an optional type makes the type checker ask for the one check `None` needs.

#### Examples

```py title="Avoid"
@dataclass(frozen=True, slots=True, kw_only=True)
class Customer:
    id: CustomerId
    phone: str  # "" when the customer gave none
```

```py title="Prefer"
@dataclass(frozen=True, slots=True, kw_only=True)
class Customer:
    id: CustomerId
    phone: str | None
```

### not-given-spelled-by-one-sentinel · MUST

Wherever `None` is itself a value a caller passes, every “not given” is one sentinel declared once. A patch that clears a field passes such a `None`, and the sentinel is the built-in `sentinel` where the `requires-python` floor is 3.15 or later, and below it the one member of an `enum.Enum` of its own, never of a `StrEnum` or an `IntEnum`, whose member passes for a `str` or an `int`.

#### Why

Without a declared sentinel “not given” and “cleared” are one `None`, so a patch clears a field its caller never named, two sentinels for one meaning fail each other's identity check, and a sentinel that is a `str` passes the type check wherever a string is expected, so it is stored as one.

#### Examples

```py title="Avoid"
def patch_customer(customer: Customer, *, phone: str | None = None) -> Customer:
    if phone is None:  # a phone cleared on purpose is ignored too
        return customer
    return replace(customer, phone=phone)
```

```py title="Prefer"
class NotGiven(Enum):
    NOT_GIVEN = auto()


def patch_customer(
    customer: Customer, *, phone: str | None | NotGiven = NotGiven.NOT_GIVEN
) -> Customer:
    if phone is NotGiven.NOT_GIVEN:
        return customer
    return replace(customer, phone=phone)
```

### absence-tested-by-is-none → absence-spelled-by-one-value · MUST

Every test of absence is `is None` or `is not None`. A default for an absent value is chosen on that test, never by `if not x` or `x or default` where the value is not a `bool`.

#### Why

A negation and an `or` also treat `0`, `''` and `[]` as absent, a bug waiting for its input.

#### Examples

```py title="Avoid"
_DEFAULT_FREE_DELIVERY_FROM: Final = Decimal("100")


def free_delivery_from(configured: Decimal | None) -> Decimal:
    return configured or _DEFAULT_FREE_DELIVERY_FROM  # a configured 0 reads as absent
```

```py title="Prefer"
_DEFAULT_FREE_DELIVERY_FROM: Final = Decimal("100")


def free_delivery_from(configured: Decimal | None) -> Decimal:
    if configured is None:
        return _DEFAULT_FREE_DELIVERY_FROM
    return configured
```

### instant-is-an-aware-datetime → instant-is-an-exact-time · MUST

Every `datetime` carries its time zone. `now` and `fromtimestamp` are given a `tz`, the constructor a `tzinfo` and `strptime` a `%z`, and `datetime.utcnow`, `datetime.utcfromtimestamp`, `datetime.today` and `date.today` are never called.

#### Why

A naive `datetime` is read in the machine's zone by one function and in UTC by the next, and the two compare as if they were the same instant.

#### Examples

```py title="Avoid"
class SystemClockAdapter:
    def now(self) -> datetime:
        return datetime.utcnow()
```

```py title="Prefer"
class SystemClockAdapter:
    def now(self) -> datetime:
        return datetime.now(UTC)
```

### wall-time-kept-with-its-zoneinfo → person-set-time-kept-with-its-zone · MUST

Every time a person sets in a place is a `datetime` of its wall time with that place's `zoneinfo.ZoneInfo`. The kept value is never converted to UTC or to a fixed offset.

#### Why

A time converted to UTC or to a fixed offset when it is kept stays put when its zone's rules change, so the meeting the person set at ten moves to nine or eleven.

#### Examples

```py title="Avoid"
def book_delivery_slot(day: date, start: time, zone: ZoneInfo) -> DeliverySlot:
    starts_at = datetime.combine(day, start, tzinfo=zone).astimezone(UTC)
    return DeliverySlot(starts_at=starts_at)
```

```py title="Prefer"
def book_delivery_slot(day: date, start: time, zone: ZoneInfo) -> DeliverySlot:
    starts_at = datetime.combine(day, start, tzinfo=zone)
    return DeliverySlot(starts_at=starts_at)
```

### duration-measured-by-a-python-monotonic-clock → duration-measured-on-a-monotonic-clock · MUST

Every duration the program measures is read from one of Python's monotonic clocks. Such clocks include `time.monotonic()`, `time.perf_counter()`, their `_ns` forms and an event loop's `loop.time()`, and a duration is never a difference of `time.time()` or of two `datetime.now()`.

#### Why

The wall clock jumps when it is corrected, and a duration measured across the jump is wrong or negative.

#### Examples

```py title="Avoid"
started = time.time()
receipt = await gateway.charge(payment)
metrics.observe_charge_seconds(time.time() - started)
```

```py title="Prefer"
started = time.monotonic()
receipt = await gateway.charge(payment)
metrics.observe_charge_seconds(time.monotonic() - started)
```

### exact-quantity-is-an-int-or-a-decimal → exact-quantity-never-binary-float · MUST

Every exact decimal quantity is an `int` of its smallest unit or a `decimal.Decimal`. A `Decimal` is built from a string or an `int`, never from a `float`.

#### Why

`Decimal(0.1)` keeps the binary error of the float it was given, while `Decimal('0.1')` is exact.

#### Examples

```py title="Avoid"
_VAT_RATE: Final = Decimal(0.23)  # keeps the float's binary error


def gross(net: Decimal) -> Decimal:
    return net * (1 + _VAT_RATE)
```

```py title="Prefer"
_VAT_RATE: Final = Decimal("0.23")


def gross(net: Decimal) -> Decimal:
    return net * (1 + _VAT_RATE)
```

### path-handled-by-pathlib · SHOULD

Every file-system path is a `pathlib.Path`. It is joined with `/` and read through its methods, never a string built with `os.path`.

#### Why

One object joins, resolves and reads a path, where a string path is joined by hand and a separator or a `..` slips through.

#### Examples

```py title="Avoid"
def invoice_path(archive_root: str, invoice_id: InvoiceId) -> str:
    return os.path.join(archive_root, "invoices", f"{invoice_id}.pdf")
```

```py title="Prefer"
def invoice_path(archive_root: Path, invoice_id: InvoiceId) -> Path:
    return archive_root / "invoices" / f"{invoice_id}.pdf"
```
