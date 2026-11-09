# Text

> Governs where copy is made from the codes the domain and the application layer hand on.

## General

### domain-returns-codes-not-text → code-placed-by-its-reason-to-change · SHOULD

The domain and the application layer hand on codes and values, never copy, whether returned or passed to a port. The presentation, or an adapter whose port takes codes and values, turns them into copy. Exempt: an error's debug text.

#### Why

A domain that hands on copy is tied to one language and one wording, so a new locale, or a screen that words a code its own way, changes the business rules.

#### Examples

```pseudo title="Avoid"
# carts/domain/cart/transitions/cart.transitions
if cart.lines.length >= maxLines then
  throw new CartFullError("Your cart holds at most 50 lines.")
```

```pseudo title="Prefer"
# carts/domain/cart/transitions/cart.transitions
if cart.lines.length >= maxLines then
  throw new CartFullError({ cartId: cart.id, maxLines })

# carts/presentation/bindings/commands/add-line
catch CartFullError as failure
  showNotice(translate(messages.cartFull, locale, { maxLines: failure.maxLines }))
```

### catalogue-library-never-imported-by-the-domain → layer-imports-dependencies-by-its-role · MUST

The domain layer and the kernel never import the catalogue library, which is no format library.

#### Why

A domain that imports the catalogue library words its own rules, so a change of wording or of library reaches the business.

#### Examples

```pseudo title="Avoid"
# carts/domain/cart/errors/cart-full.error
import { translate } from "catalogue-library"

class CartFullError
  message = translate("cart.full")
```

```pseudo title="Prefer"
# carts/domain/cart/errors/cart-full.error
class CartFullError
  code = "CART_FULL"

# carts/presentation/bindings/commands/add-line
import { translate } from "catalogue-library"
```
