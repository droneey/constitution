# Composition

> Governs how features relate — how one asks another, when a type or a port lifts because several features share it, how one reacts to another — and how composition combines them.

## Asking

### feature-asks-another-through-its-own-port · MUST

A feature asks another through a port of its own. It declares the port in its own words — its parameters, its results and the failures it acts on — and receives an input built for it. Composition implements the port through the other feature’s surface, maps the other’s results into the asker’s terms and the failures the asker acts on into the asker’s own, and passes every other failure on as a defect.

| Why |
|---|
| a feature that holds another's types or failures breaks whenever the other changes its domain model, and can no longer change apart from it — an anti-corruption layer. |

## Sharing

### type-lifts-when-features-share-its-meaning · MUST

A type of the domain model lifts to the kernel only when features share its meaning. Only a value object — an enumeration or an identifier among them — lifts, and it belongs to the feature whose domain model holds it until two or more features use it with one meaning, the one the glossary gives its word in each of them. An entity never lifts, since one feature owns its life. A feature that needs another's entity, or a type whose meaning differs for it or of which it uses only a sliver, keeps its own narrow view of it — a type of its own or a reference by identifier — into which composition translates the other’s.

| Why |
|---|
| one meaning has one home every feature reads, while a type shared by features that read it differently must satisfy them all and stops them changing apart, and an entity in the kernel has a life no feature owns; a narrow view changes with its feature alone — shared kernel. |

### port-lifts-on-its-second-feature · MUST

A port stays with the feature that needs it until a second feature needs it in the same words from an outside system. It then lifts to the kernel's `contracts/`, as a clock's or a mailer's does, and never sideways into one of the features. A port each feature words its own way stays in each feature, and a port another feature answers never lifts: each feature that asks it words its own.

| Why |
|---|
| a port owned by one feature and used by another couples the second to the first, and one lifted while a feature answers it carries that feature's domain model and failures into the kernel. |

## Combining

### composition-holds-what-the-business-combines · MUST

What the business combines across features is an operation of a composition module. A fact joined, sorted or paged across features, a total or a decision across them is such an operation from its first use, and its use case calls each feature's operations through their surfaces. What it translates between the features' vocabularies — one feature's status into another's, a failure of a feature it acts on into one of its own — is a total table it owns, kept in the module and never in a feature, and a failure of a feature it does not act on passes as a defect. Its domain, where it has one, holds only a rule, or the state of a process, that spans the features it composes. Showing or handing on several features' answers together combines nothing of the business.

| Why |
|---|
| a rule of the business across features written in one screen is copied by every other interface that needs it and drifts between them, while a screen that only lays answers side by side changes with the screen, not with the business; a translation kept in one of the features makes it know the other, and one that is not total takes a value a feature adds into a case nobody chose. |

## Reacting

### feature-reacts-to-another-only-through-composition · MUST

A feature reacts to another feature's events only through composition. It offers its own events through its surface and never subscribes to another feature's; the reaction is a use case of a composition module, which reaches the other feature's events and calls the reacting feature's operation through their surfaces, and which a subscription in that module's presentation binds.

| Why |
|---|
| a feature that subscribes to another depends on its events as much as on an import, and a chain of reactions hidden in subscribers spread through the features is one no reader can follow from one place — orchestration, in the stricter form that lets no feature subscribe to another's published events. |
