# Deployment

> Governs how a Python program reads its configuration inputs from its environment variables.

## Configuration inputs

### configuration-input-read-from-os-environ-only-by-the-provider → configuration-inputs-read-only-by-the-configuration-provider · MUST

Only the configuration provider reads a configuration input from `os.environ`, `os.environb` or `os.getenv`. Exempt: a spec, which may read the configuration inputs to drive the program.

#### Why

A configuration input read from the process anywhere else, an entry file included, is a dependency on the host that no signature shows and no spec can hand in.

#### Examples

```py title="Avoid"
# src/shop/features/payments/infrastructure/stripe/stripe_payment_adapter.py
class StripePaymentAdapter:
    def __init__(self) -> None:
        self._client = StripeClient(os.environ["STRIPE_API_KEY"])
```

```py title="Prefer"
# src/shop/features/payments/infrastructure/stripe/stripe_payment_adapter.py
class StripePaymentAdapter:
    def __init__(self, api_key: str) -> None:
        self._client = StripeClient(api_key)

# src/shop/infrastructure/settings/settings.py
def read_settings() -> Settings:
    return parse_settings(os.environ)
```
