# pytest: no spec reaches the network
import socket

import pytest


def _refuse_network(*_args: object, **_kwargs: object) -> None:
  message = 'a spec reached the network: give it the fake of its transport'
  raise ConnectionRefusedError(message)


@pytest.fixture(autouse=True)
def network_refused(monkeypatch: pytest.MonkeyPatch) -> None:
  monkeypatch.setattr(socket, 'getaddrinfo', _refuse_network)
  monkeypatch.setattr(socket.socket, 'connect', _refuse_network)
  monkeypatch.setattr(socket.socket, 'connect_ex', _refuse_network)
