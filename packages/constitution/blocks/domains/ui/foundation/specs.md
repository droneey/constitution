# Specs

> Governs the specs of screens and components: what they prove, how they find an element, and where a screenshot belongs.

## General

### screen-spec-proves-states-and-interactions → spec-proves-one-boundary · SHOULD

A screen's spec proves each data state, each interaction that changes something, each message the user sees and each navigation.

| Why |
|---|
| that is what a person does with a screen; a spec that proves it fails when their experience changes. |

### component-spec-proves-behaviour-and-keyboard → spec-proves-one-boundary · SHOULD

A reusable component's spec proves the variants that change behaviour or meaning, its keyboard use, its focus, and its accessible name, role and state.

| Why |
|---|
| a component used on many screens breaks all of them at once; its spec is where that is caught. |

### element-found-by-role-label-or-text → case-asserts-what-a-caller-observes · MUST

An element a spec looks for is found by its role, its label or its text, never by a class or internal state; an element no person perceives — one hidden from assistive technology, or a framework's own element — is found by an attribute the code that renders it sets for the spec; and a selector the program configures a framework with is checked by one spec, through that same constant.

| Why |
|---|
| a spec that finds elements as a user does changes only when the behaviour does, and an element no user perceives has nothing else a spec can find it by but an attribute set for the spec; a selector handed to a framework is a contract with markup the program does not render, which only a spec of that selector proves. |

### layout-and-focus-proven-on-the-platform · SHOULD

Behaviour that depends on layout, visibility or real focus is proven where the platform renders it — an end-to-end spec, or a component spec the platform's own engine runs — never only in a simulation of the platform.

| Why |
|---|
| a simulated screen computes no layout and fakes focus, so a spec there passes while the element is hidden, covered or unreachable. |

### screenshots-only-where-look-is-contract → snapshot-readable-by-eye · SHOULD

Appearance is compared by screenshot only where the look is the contract, such as a showcase of primitives.

| Why |
|---|
| screenshots elsewhere fail on every harmless change of style and are approved without reading. |
