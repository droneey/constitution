# Domain

> Governs the form of an entity's rules.

## Where rules live

### entity-rules-held-by-its-companion → entity-rule-lives-beside-the-entity · SHOULD

An entity with rules of its own is a `readonly` type and a `const` object of the same name, declared in its file, whose functions take the entity as their first parameter: `Rule.create`, `Rule.tightenedBy(rule, other)`, `Rule.withLevel(rule, level)`. The entity is made only by its `create`, and only the companion spreads its fields to make a changed one.

| Why |
|---|
| everything about an entity is found in one place under its own name, and its data stays plain at every boundary. |
