# Layout

> Governs a package's tree in Python: its surfaces and the form of its imports.

## Vocabulary

A module path joins words by underscores, so Python spells two of core's role folders its own way: **`use_cases/`**{#use-case} holds the use cases, and **`value_objects/`**{#value-object} holds the value objects.

A role suffix joins a module's name by an underscore, in snake_case, since a dot would make the module impossible to import by its name: **`_entity`**{#entity-file}, **`_aggregate`**{#aggregate-file}, **`_value_object`**{#value-object-file}, **`_service`**{#domain-service-file}, **`_transitions`**{#aggregate-transition-file}, **`_event`**{#domain-event-file}, **`_error`**{#error-file}, **`_port`**{#port-file}, **`_adapter`**{#adapter-file}, **`_use_case`**{#use-case-file}, **`_dto`**{#wire-model-file}, **`_utils`**{#helper-file}, **`_types`**{#type-file}, **`_constants`**{#constant-file} and **`_config`**{#config-file}.

A file's **own folder module** is the outermost folder module that holds it, such as a feature, a composition module, a lib or a folder module of a shared layer, or else the top-level folder of the import package it sits in.

## Surfaces

### import-within-the-own-folder-module-relative · SHOULD

Every import of a file within its own folder module is relative. Exempt: a file directly in its import package, whose imports `relative-imports-stay-in-the-module` gives.

#### Why

A file that imports its own folder module by its absolute name reads as if it crossed the module's border.

#### Examples

```py title="Avoid"
# src/shop/features/orders/application/use_cases/commands/place_order_use_case.py
from shop.features.orders.application.contracts.payment_gateway_port import PaymentGatewayPort
from shop.features.orders.domain.order.entities.order_aggregate import DraftOrder
```

```py title="Prefer"
# src/shop/features/orders/application/use_cases/commands/place_order_use_case.py
from ...contracts.payment_gateway_port import PaymentGatewayPort
from ....domain.order.entities.order_aggregate import DraftOrder
```

### relative-imports-stay-in-the-module · SHOULD

Every import that leaves a file's own folder module, and every import by a file directly in its import package, is absolute. Such files include `main.py` and `__main__.py`. Every such import of the import package's own code starts from its name, and no relative import climbs out of a folder module. Exempt: the import package's own surface, whose `from .<module> import <Name>` lines `surface-is-init-with-sorted-all` gives.

#### Why

A relative import that climbs out of its folder module hides from its reader that it crosses the module's border, which an import from the import package's name shows at a glance, and a file at the top of the import package that a packager or its path runs as the main module is named `__main__`, where only an absolute import resolves — the Python tutorial.

#### Examples

```py title="Avoid"
# src/shop/main.py
from .root import run_program

# src/shop/features/orders/domain/order/entities/order_aggregate.py
from ......kernel.value_objects.money_value_object import Money
```

```py title="Prefer"
# src/shop/main.py
from shop.root import run_program

# src/shop/features/orders/domain/order/entities/order_aggregate.py
from shop.kernel.value_objects.money_value_object import Money
```

### surface-is-init-with-sorted-all → surface-only-re-exports · MUST

Every surface lists what it offers in a sorted `__all__`. It holds only `from .<module> import <Name>` lines and that `__all__`.

#### Why

A surface without `__all__` leaves its readers and the type checker to guess which of its names it offers, and an unsorted list buries an added or removed name in a reordered diff.

#### Examples

```py title="Avoid"
# src/shop/features/orders/__init__.py
from .application.use_cases.commands.cancel_order_use_case import cancel_order
from .application.use_cases.commands.place_order_use_case import place_order
from .application.use_cases.queries.get_order_use_case import get_order
```

```py title="Prefer"
# src/shop/features/orders/__init__.py
from .application.use_cases.commands.cancel_order_use_case import cancel_order
from .application.use_cases.commands.place_order_use_case import place_order
from .application.use_cases.queries.get_order_use_case import get_order

__all__ = ["cancel_order", "get_order", "place_order"]
```

### init-of-a-folder-without-a-surface-empty → surface-only-on-a-module-or-one-kind · MUST

Every `__init__.py` of a folder with no surface is empty. Such folders include a layer folder, a domain layer's `shared/` and the top folder of the import package of a program no package imports. Exempt: the `__init__.py` of `root/`, the one layer folder with a surface.

#### Why

An `__init__.py` that offers a layer's members lets one import reach both sides of a boundary and couples its caller to members it never uses.

#### Examples

```py title="Avoid"
# src/shop/features/orders/domain/__init__.py
from .order.entities.order_aggregate import DraftOrder, PaidOrder
from .order.value_objects.order_id_value_object import OrderId

__all__ = ["DraftOrder", "OrderId", "PaidOrder"]
```

```py title="Prefer"
# src/shop/features/orders/domain/__init__.py
```
