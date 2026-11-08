# Layers

> Governs the layers in Python: which units may set a timer or import a module of the standard library that holds an effect.

## Effects

### sleep-or-call-later-only-at-the-edge → effects-held-only-by-the-edge · MUST

Every timer is started only at the edge, whether `asyncio.sleep`, `loop.call_later`, `loop.call_at` or `threading.Timer`. Exempt: a binding unit's timer that schedules its own work.

#### Why

A timer reads the clock, so code that sets one outside the edge waits on time no spec can hand in.

#### Examples

```py title="Avoid"
# src/shop/features/invoices/application/use_cases/commands/remind_unpaid_invoice_use_case.py
async def remind_unpaid_invoice(invoice: Invoice, mailer: MailerPort) -> None:
    await asyncio.sleep(timedelta(days=3).total_seconds())
    await mailer.send_reminder(invoice.id)
```

```py title="Prefer"
# src/shop/features/invoices/application/use_cases/commands/remind_unpaid_invoice_use_case.py
async def remind_unpaid_invoice(invoice: Invoice, reminders: RemindersPort) -> None:
    await reminders.schedule(invoice.id, after=timedelta(days=3))
```

### standard-module-with-an-effect-imported-only-by-the-edge → effects-held-only-by-the-edge · MUST

Outside the edge, no module imports a module of the standard library that holds an effect. Those are `ctypes`, `curses`, `dbm`, `fcntl`, `fileinput`, `ftplib`, `getpass`, `glob`, `grp`, `http.client`, `imaplib`, `mmap`, `multiprocessing`, `os`, `platform`, `poplib`, `pty`, `pwd`, `random`, `resource`, `runpy`, `secrets`, `select`, `selectors`, `shelve`, `shutil`, `signal`, `smtplib`, `socket`, `socketserver`, `sqlite3`, `ssl`, `subprocess`, `syslog`, `tempfile`, `termios`, `time`, `tty`, `urllib.request`, `webbrowser`, `wsgiref` and `xmlrpc`.

#### Why

Each of these reaches the file system, the network, a process, randomness or the clock, so a unit of logic that imports one holds an effect no port shows, and its specs need the real effect or a patch of it.

#### Examples

```py title="Avoid"
# src/shop/features/coupons/domain/coupon/transitions/coupon_transitions.py
import secrets


def issue_coupon(discount: Discount) -> Coupon:
    return Coupon(code=CouponCode(secrets.token_urlsafe(8)), discount=discount)
```

```py title="Prefer"
# src/shop/features/coupons/domain/coupon/transitions/coupon_transitions.py
def issue_coupon(code: CouponCode, discount: Discount) -> Coupon:
    return Coupon(code=code, discount=discount)
```
