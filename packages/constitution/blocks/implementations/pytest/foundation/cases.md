# Cases

> Governs how a pytest case is written: the variants of one behaviour.

## Variants

### variants-are-parametrize-rows-with-ids → variants-are-one-table · SHOULD

The variants of one behaviour are the rows of one `@pytest.mark.parametrize` on one `test_` function, each a `pytest.param(…, id='when <condition>')` holding its input and its expected value.

| Why |
|---|
| each row then runs, passes and fails as a case of its own, and its id names the condition in the report. |
