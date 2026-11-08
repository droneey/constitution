# Types

> Governs a value in a document and its type: how a boolean attribute is written.

## Attributes

### boolean-attribute-written-by-presence · MUST

Every boolean attribute is present where it is true and absent where it is false. It is never present with a value meant as false, such as `disabled="false"`.

| Why |
|---|
| the browser reads any value of a boolean attribute, `"false"` included, as true, so `disabled="false"` disables. |
