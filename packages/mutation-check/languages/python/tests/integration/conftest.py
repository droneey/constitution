import pytest


# The integration specs reach the engines they start, so the refusal is lifted by its name.
@pytest.fixture(autouse=True)
def network_refused() -> None:
  return None
