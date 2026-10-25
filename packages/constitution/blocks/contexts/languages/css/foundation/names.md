# Names

> Governs the names of classes.

## Meaning

### class-named-for-what-the-element-is → name-reveals-intent · SHOULD

A class the project declares names what its element is — `.order-summary` — never how it looks: `.red`, `.mt-4`.

| Why |
|---|
| a name that says what an element is stays true when its look changes; one that says how it looks lies after the first redesign. |

## Form

### class-name-in-kebab-case → name-case-by-kind · SHOULD

A class the project declares is written in kebab-case: `.order-summary`, `.order-summary-title`.

| Why |
|---|
| one case leaves no class spelled two ways, and a search for a name finds every use of it. |
