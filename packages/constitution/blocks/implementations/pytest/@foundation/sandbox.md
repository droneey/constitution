# Sandbox

> Governs the sandbox the specs run in: the network, patching and waits.

## General

### network-refused-by-the-conftest → unit-spec-refuses-the-network · MUST

Every unit spec runs with the network refused by an autouse fixture of `tests/conftest.py`. It replaces `socket.getaddrinfo`, `socket.socket.connect` and `connect_ex` with functions that raise. Exempt: the integration specs, whose `tests/integration/conftest.py` overrides the fixture by its name.

#### Why

The standard library's clients, and the libraries built on them, open every connection through these calls of `socket`, so a spec that reaches a server past them talks to the world, and a refusal each spec must write is missing from the first spec that forgets it; an autouse fixture holds for every spec under its folder with no line in the spec — fail fast.

#### Examples

```py title="Avoid"
# tests/features/payments/application/use_cases/commands/test_charge_card_use_case.py
@pytest.fixture
def no_network(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(socket.socket, "connect", _refuse)


def test_should_charge_the_card_when_it_is_valid(no_network: None) -> None:
    ...
```

```py title="Prefer"
# tests/conftest.py
def _refuse(*args: object, **kwargs: object) -> NoReturn:
    raise NetworkRefusedError


@pytest.fixture(autouse=True)
def refuse_network(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(socket, "getaddrinfo", _refuse)
    monkeypatch.setattr(socket.socket, "connect", _refuse)
    monkeypatch.setattr(socket.socket, "connect_ex", _refuse)
```

### module-never-patched-in-a-spec → effect-faked-never-mocked · MUST

No spec patches a module of the program. It uses no `unittest.mock`, and `monkeypatch` changes only what the sandbox and the environment hold.

#### Why

An object put in a module's place by `unittest.mock` or `monkeypatch` replaces the code the spec claims to test and breaks when the module moves; the environment has no contract to fake, so `monkeypatch` stays for it.

#### Examples

```py title="Avoid"
def test_should_email_the_receipt_when_the_order_is_paid() -> None:
    # Arrange
    with patch("shop.orders.infrastructure.smtp.mailer.send") as send:
        pay_order = make_pay_order(orders=OrderRepositoryFake([a_placed_order()]))
        # Act
        pay_order(PayOrderInput(order_id=ORDER_ID))

    # Assert
    assert send.call_count == 1
```

```py title="Prefer"
def test_should_email_the_receipt_when_the_order_is_paid() -> None:
    # Arrange
    mailer = MailerFake()
    pay_order = make_pay_order(orders=OrderRepositoryFake([a_placed_order()]), mailer=mailer)
    # Act
    pay_order(PayOrderInput(order_id=ORDER_ID))

    # Assert
    assert mailer.outbox == [a_receipt()]
```

### spec-never-calls-a-sleep → test-never-sleeps-a-fixed-time · SHOULD

No spec calls `time.sleep`, nor `asyncio.sleep` or `anyio.sleep` with a delay above zero.

#### Why

A fixed delay is too short on a slow machine and wasted on a fast one, and these are the calls a Python spec makes it with; the anyio clock or a wait on a condition replaces them.

#### Examples

```py title="Avoid"
def test_should_expire_the_reservation_when_its_hold_has_passed() -> None:
    # Arrange
    reservation = reserve_stock(a_cart(), hold=timedelta(seconds=1), clock=SystemClockAdapter())
    time.sleep(1.1)
    # Act
    is_expired = reservation.is_expired()

    # Assert
    assert is_expired
```

```py title="Prefer"
def test_should_expire_the_reservation_when_its_hold_has_passed() -> None:
    # Arrange
    clock = ClockFake(NOON)
    reservation = reserve_stock(a_cart(), hold=timedelta(seconds=1), clock=clock)
    clock.advance(timedelta(seconds=2))
    # Act
    is_expired = reservation.is_expired()

    # Assert
    assert is_expired
```
