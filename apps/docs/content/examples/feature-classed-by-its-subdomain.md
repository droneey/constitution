```md title="Avoid"
# PROJECT.md

## Features

- fares
- bookings
- notifications
```

```md title="Prefer"
# PROJECT.md

## Subdomains

The core domain is dynamic fares.

| Feature | Subdomain | Class |
|---|---|---|
| fares | dynamic fares | core |
| bookings | seat reservations | supporting |
| notifications | messaging | generic |
```
