# YAML

> Governs the code that parses YAML.

## General

### yaml-timestamp-constructed-as-text → reader-resolves-scalars-by-the-core-schema · MUST

Every YAML timestamp the code parses, an explicitly tagged one included, is constructed as text, never as a `date` or a `datetime`.

#### Why

YAML 1.2's core schema has no timestamp, yet the Python loaders in common use still build a `!!timestamp` tag as a `date` or a `datetime`, so a value its writer tagged reaches the program built by the loader's rules, not by the program's own parse — YAML 1.2.

#### Examples

```py title="Avoid"
def load_price_list(text: str) -> object:
    return yaml.safe_load(text)  # valid_from: 2026-01-01 arrives as a date
```

```py title="Prefer"
class _TextTimestampLoader(yaml.SafeLoader):
    pass


_TextTimestampLoader.add_constructor(
    "tag:yaml.org,2002:timestamp",
    _TextTimestampLoader.construct_yaml_str,
)


def load_price_list(text: str) -> object:
    return yaml.load(text, Loader=_TextTimestampLoader)
```

## YAML from outside

### yaml-from-outside-refused-with-an-alias → alias-expansion-bounded · MUST

Every YAML document from outside the program that holds an alias is refused before any value is built from it.

#### Why

The Python loaders in common use build an alias as one more reference to the value it names, so a document of a few nested aliases loads small and passes every check of its size, then grows into more data than the program can hold once code walks or writes the value.

#### Examples

```py title="Avoid"
def read_order_import(text: str) -> object:
    return yaml.safe_load(text)
```

```py title="Prefer"
def read_order_import(text: str) -> object:
    events = yaml.parse(text, Loader=yaml.SafeLoader)
    if any(isinstance(event, yaml.AliasEvent) for event in events):
        raise YamlAliasRefusedError

    return yaml.load(text, Loader=_TextTimestampLoader)
```
