# Analytics with a user interface

> Governs page views.

## Page views

### page-view-named-by-route-template · MUST
A page view names its screen by the template of its address — `/chats/:id` — never by the address with its identifiers or query values.

| Why | Tags |
|---|---|
| views of one screen then add up to one row, and no identifier in an address reaches the analytics service. | [data, security] |
