# Components

> Governs a component's name, its hidden parts, a compound, its slots and its controllable props.

## Names

### components-named-in-pascal-case → identifier-case-by-kind · SHOULD

A component is named in PascalCase, and so is the key a compound's part is reached by.

| Why |
|---|
| React renders a lower-case name as an element of the platform, so a component named so is never rendered as itself. |

## Hidden parts

### hidden-state-kept-by-activity · SHOULD

A hidden part that must keep its state is hidden by `<Activity>`. Such a part — a tab panel, a step, a view the user comes back to — is wrapped in `<Activity mode="hidden">`, neither unmounted nor hidden by a style alone.

| Why |
|---|
| unmounting loses the state, and a part hidden by a style alone keeps its effects running. |

## Compounds

### compound-parts-share-the-root-context → component-with-regions-is-a-compound · SHOULD

A compound's parts are reached only through its root and share its context. Its regions take the caller's content as children, never a prop per region, and its parts are attached to the root with a typed `Object.assign` and reached as `Root.Part`, never imported on their own: the compound exports only its root and its prop types, and the root shares its state, the choreography of animated regions included, through `<name>.context.ts`.

| Why |
|---|
| a part used without its root loses the root's context; through it the parts read what the root decides without props threaded through the consumer's markup, and the dot names the compound a part belongs to. |

## Props

### slot-and-container-children-typed · SHOULD

A slot's or a container's children are typed by what it does with them. A slot that keeps control of its element takes a `ReactElement`, a container takes `ReactNode`, and a render-prop slot is `(children, …data) => ReactElement`.

| Why |
|---|
| a slot typed wider than it handles accepts a string or a list it cannot control, and its caller learns of it at run time instead of from the compiler. |

### controllable-props-named-value-default-change → stateful-component-controllable-or-not · SHOULD

A controllable value's props are `<name>`, `default<Name>` and `on<Name>Change`. The value is `<name>`, its initial value `default<Name>` and its callback `on<Name>Change`, one component takes the three, and one hook resolves them.

| Why |
|---|
| a component that names the three its own way is learned apart from the primitive library and the platform's elements around it, which all use these names. |
