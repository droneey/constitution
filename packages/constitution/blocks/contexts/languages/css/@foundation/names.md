# Names

> Governs a name in a stylesheet: what a class is named for, and its case.

## Meaning

### class-named-for-what-the-element-is → name-reveals-intent · SHOULD

Every class the project declares names what its element is, never how it looks.

| Why |
|---|
| a name that says what an element is stays true when its look changes; one that says how it looks lies after the first redesign. |

## Form

### class-name-in-kebab-case → name-case-by-kind · SHOULD

Every class the project declares is written in kebab-case.

| Why |
|---|
| a class spelled in two cases is two classes to the browser, so markup that spells it the other way stays unstyled, and a search for one spelling misses the other. |
