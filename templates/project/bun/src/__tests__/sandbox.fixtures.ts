// A declaration, not an arrow, so that `new WebSocket()` throws this error too.
function refuseNetwork(): never {
  throw new Error('A spec reached the network: give it the fake of its transport');
}

for (const name of [
  'fetch',
  'WebSocket',
]) {
  Object.defineProperty(globalThis, name, {
    value: refuseNetwork,
  });
}

Bun.connect = refuseNetwork;
