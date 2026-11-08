# Presentation

> Governs how a subcommand reaches the screen it renders.

## Rendering

### subcommand-renders-through-a-renderer-the-root-hands → binding-unit-imports-nothing-of-the-ui · MUST

Every subcommand's binding unit renders its screen only through a renderer the composition root hands it. It never imports the terminal's renderer, which the handed renderer loads.

#### Why

A binding unit that imports the terminal's renderer makes the choice between the terminal and the plain path itself, where the renderer the root builds and hands it should, so no pipe or spec can take the plain path without the terminal.

#### Examples

```tsx title="Avoid"
// src/features/orders/presentation/bindings/queries/show-order.tsx
import { render } from "ink";

export const createShowOrderCommand = ({
  showOrder,
  context,
}: ShowOrderCommandDependencies): Command =>
  new Command("show").argument("<number>").action(async (number: string) => {
    render(<OrderView order={await showOrder({ number }, context)} />);
  });
```

```tsx title="Prefer"
// src/features/orders/presentation/bindings/queries/show-order.tsx
export const createShowOrderCommand = ({
  showOrder,
  renderer,
  context,
}: ShowOrderCommandDependencies): Command =>
  new Command("show").argument("<number>").action(async (number: string) => {
    await renderer.render(<OrderView order={await showOrder({ number }, context)} />);
  });
```
