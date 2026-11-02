# Presentation

> Governs the presentation: the units through which the program is called, what they call and what they decide.

## The vocabulary

The presentation is all through which the program is called. An interface is one way the program is called — a user interface, an API, a command line, a consumer of messages, a schedule —, and the presentation holds every interface the program has. A **delivery unit**{#delivery-unit} is a unit its framework calls from outside the program: a screen, a command, a request handler, a message consumer, a tool function, a scheduled job. A **binding unit**{#binding-unit} binds to the program's framework one operation — reading what the framework hands it, calling the operation's use case, and handing the framework what the use case returns or the failure it raised — or one decision made for every operation of an interface, as the handler of last resort, an error filter or a guard that authenticates the caller does. A delivery unit that serves one operation is its binding unit; one that serves several reaches each operation through its binding unit, or binds it itself as that binding unit would. The **program's presentation**{#program-presentation}, at the top of the source, holds the program's pages and the views they share, the binding units of the decisions made for every operation of an interface, and the delivery units and the units that render that span several features or composition modules.

## Homes

### delivery-unit-beside-what-it-serves · MUST

A delivery unit lives beside what it serves. It lives in the presentation of the feature or the composition module whose operations it serves, or in the program's presentation when it spans several or is a page of the program.

| Why |
|---|
| a delivery unit kept away from the operations it serves is changed in a second place whenever they change — the common closure principle. |

## What it calls

### presentation-reaches-only-what-it-serves · MUST

A presentation calls and renders only what it serves. A feature's presentation calls only its own feature's operations and the predicates and derived values of its aggregates and value objects, and renders only its own units; a composition module's calls only that module's operations and the predicates and derived values of what they return, and renders its own units and those of the features it composes; the program's presentation calls the operations of any feature or composition module and the predicates and derived values their surfaces offer, and renders their units.

| Why |
|---|
| a presentation that calls or renders past what it serves is tied to features it does not serve, and changes whenever they do. |

### binding-unit-calls-only-use-cases · MUST

A binding unit reaches its operation only through the use case, never through a port of the operation's feature. A delivery unit that binds several operations itself binds each as its binding unit would, through the operation's use case.

| Why |
|---|
| a binding unit that calls a port of its operation's feature skips the use case with its rules and steps, and ties the interface to the store or service the composition root chose — ports and adapters. |

### delivery-unit-stays-thin · MUST

A delivery unit stays thin. It reads its input off what its framework hands it, calls the operations whose results it presents, and presents what they return; it holds no business logic, and what an operation reports reaches it as a returned value, never as output printed along the way.

| Why |
|---|
| business logic in a delivery unit cannot be reused by another transport or tested without it — Humble Object. |

## What it decides

### missing-refused-or-failed-answered-in-the-presentation · MUST

What the program answers when something is missing, refused or failed is decided in the presentation. The binding unit of the operation, or the delivery unit that renders its answer, decides it, and no unit of another layer does; such answers are a not-found answer, a redirect, what a refusal shows its user, a failure's message with its exit code or its response, and the answer of an entry's handler of last resort. Among the binding units that decide it for every operation are the handler of last resort and an error filter.

| Why |
|---|
| such an answer decided elsewhere either ties the business to one interface's way of answering, or sits in the composition root or a registration, which are left out of coverage and mutation, where only the boot spec sees the program start, so no case proves it — Humble Object. |
