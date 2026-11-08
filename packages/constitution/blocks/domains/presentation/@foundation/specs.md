# Specs

> Governs the specs of screens and components: what they prove, how they find an element, where a screenshot belongs, and the showcase of component primitives.

## General

### screen-spec-proves-what-a-person-does → spec-proves-one-boundary · SHOULD

Every screen's spec proves what a person does with the screen: each data state, each interaction that changes something, each notice or error the person is shown and each navigation.

| Why |
|---|
| a screen spec that misses a state, an interaction, a notice or a navigation passes while that part of the person's experience breaks. |

### component-spec-proves-its-interaction → spec-proves-one-boundary · SHOULD

Every reusable component's spec proves how a person uses it: the component variants that change its behaviour or meaning, its keyboard use, its focus, and its accessible name, role and state.

| Why |
|---|
| a component used on many screens breaks all of them at once, and its spec is where that is caught. |

### element-found-by-role-label-or-text → case-asserts-what-a-caller-observes · SHOULD

Every spec finds an element by its role, its label or its text, never by a class or an internal state. Exempt: an element no person perceives, such as one hidden from assistive technology or a framework's own element, which is found by an attribute the code that renders it sets for the spec.

| Why |
|---|
| a spec that finds an element by a class or internal state breaks when the markup changes while the behaviour holds, and passes when the element loses the role or name a person finds it by. |

### locator-text-taken-from-its-message → case-pins-meaning-never-wording · MUST

Wherever the program keeps its texts apart from its code, every spec takes the texts it finds elements by from that source. None is typed into the spec.

| Why |
|---|
| a spec that types the wording it looks for fails on every rewording while the screen still works, so one change of text rewrites the specs. |

### framework-selector-proven-by-one-spec · MUST

Every selector the program configures a framework with is proven by one spec, which reads it through the same constant.

| Why |
|---|
| a selector handed to a framework is a contract with markup the program does not render, so only a spec of that selector catches markup that no longer matches it. |

### rendered-behaviour-proven-on-the-platform · SHOULD

Every behaviour that depends on layout, visibility or real focus is proven on the platform's own rendering engine. Its spec is an end-to-end spec or a component spec that engine runs, never one that runs only in a simulation of it.

| Why |
|---|
| a simulated screen computes no layout and fakes focus, so a spec there passes while the element is hidden, covered or unreachable. |

### screenshots-only-where-look-is-contract → snapshot-readable-by-eye · SHOULD

Appearance is compared by screenshot only where the look is the contract, such as a showcase of component primitives.

| Why |
|---|
| screenshots elsewhere fail on every harmless change of style and are approved without reading. |

### primitive-shown-whole-in-one-place · SHOULD

Every component primitive is shown in every component variant, state and theme mode, in one place people and screenshot specs both see.

| Why |
|---|
| a component variant nobody renders breaks unseen, and a component primitive shown piecemeal, or nowhere, leaves a review and a screenshot nothing whole to compare. |
