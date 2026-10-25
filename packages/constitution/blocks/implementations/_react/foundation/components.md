# Components

> Governs a component's name, a compound, its slots, its hidden parts and its controllable props.

## General

### components-named-in-pascal-case → identifier-case-by-kind · SHOULD

A component is named in PascalCase, and so is the key a compound's part is reached by.

| Why |
|---|
| React renders a lower-case name as an element of the platform, never as the component. |

### hidden-state-kept-by-activity · SHOULD

A hidden part that must keep its state — a tab panel, a step, a view the user comes back to — is wrapped in `<Activity mode="hidden">`, neither unmounted nor hidden by a style alone.

| Why |
|---|
| unmounting loses the state, and a part hidden by a style alone keeps its effects running. |

## Compounds

### compound-parts-share-the-root-context → component-with-regions-is-a-compound · SHOULD

A compound's parts are attached to its root with a typed `Object.assign`, and the root shares its state — the choreography of animated regions included — through `<name>.context.ts`.

| Why |
|---|
| the parts read what the root decides, without props threaded through the consumer's markup. |

### compound-parts-reached-through-the-root → component-with-regions-is-a-compound · SHOULD

A compound exports only its root and its prop types; a part is reached as `Root.Part`, never imported on its own.

| Why |
|---|
| a part used without its root loses the root's context, and the dot names the compound it belongs to. |

## Props

### slot-and-container-children-typed · SHOULD

A slot that keeps control of its element takes a `ReactElement`; a container takes `ReactNode`; a render-prop slot is `(children, …data) => ReactElement`.

| Why |
|---|
| the type says what the caller may pass, and the compiler refuses the rest. |

### controllable-props-named-value-default-change → stateful-component-controllable-or-not · SHOULD

The value is `<name>`, its initial value `default<Name>` and its callback `on<Name>Change`, resolved by one hook.

| Why |
|---|
| the names are the ones the primitive library and the platform use, so a component reads like the elements around it. |
