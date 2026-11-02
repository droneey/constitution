# Cases

> Governs how a pytest case is written: the variants of one behaviour.

## Variants

### variants-are-parametrize-rows-with-ids → variants-are-one-table · SHOULD

The variants of one behaviour are the rows of one `@pytest.mark.parametrize`. It decorates one `test_` function, and each row is a `pytest.param(…, id='when <condition>')` holding its input and its expected value.

| Why |
|---|
| variants looped inside one case stop at the first that fails and hide the rest, and a row without an id is reported by its index, so a failure does not say which condition broke. |
