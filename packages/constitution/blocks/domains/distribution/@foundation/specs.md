# Specs

> Governs how a configuration a distributed package ships is proven.

## General

### shipped-configuration-asserted-by-spec → constant-others-rely-on-pinned-by-a-table · SHOULD

Every configuration a distributed package ships has its settings asserted by one table in a spec that parses the configuration.

#### Why

A configuration has no behaviour to call, so one whose settings no spec asserts can say other than it means and pass every check.

#### Examples

```pseudo title="Avoid"
# __tests__/config.test
test "should export a configuration"
  assert readShippedConfig() is not <absent>
```

```pseudo title="Prefer"
# __tests__/config.test
test "should set each rule to its level"
  # Arrange
  let config = parseConfig(readShippedConfig())

  # Act
  let levels = config.levelsByRule

  # Assert
  assert levels == {
    "unused-names": "error",
    "strict-equality": "error",
    "nesting-depth": "warn"
  }
```

### shipped-configuration-loaded-by-its-real-tool · SHOULD

Every configuration a distributed package ships is loaded once in a spec by the real tool it configures. That load proves the tool accepts it.

#### Why

A table of settings proves what the configuration says, not that its tool reads it, so a key the tool renamed or a plugin it cannot find ships a configuration that fails on every consumer's first run.

#### Examples

```pseudo title="Avoid"
# __tests__/config.test
test "should set each rule to its level"
  let config = parseConfig(readShippedConfig())

  assert config.levelsByRule == expectedLevels
```

```pseudo title="Prefer"
# __tests__/config.integration.test
test "should be accepted by the lint tool"
  # Arrange
  let tool = new LintTool({ config: readShippedConfig() })

  # Act
  let result = await tool.lint(fixture("clean-module"))

  # Assert
  assert result.configurationProblems is empty
```
