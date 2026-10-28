import pytest


# Why: the integration specs reach the engines they start, so the root's refusal of the network is
# overridden.
@pytest.fixture(autouse=True)
def network_refused() -> None:
  return None
