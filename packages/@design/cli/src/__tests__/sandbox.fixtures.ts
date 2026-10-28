import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';

const REFUSAL = 'A spec reached the network: give it the fake of its transport';

// Why: a declaration, not an arrow, so `new WebSocket()` and `new Bun.SQL()` throw this error too.
function refuseNetwork(): never {
  throw new Error(REFUSAL);
}

// Why: yoga-layout, under Ink's renderer, loads its WebAssembly from a data: URL and decodes it
// itself only when fetch rejects.
const refuseFetch = async (): Promise<never> => await Promise.reject(new Error(REFUSAL));

Object.defineProperty(globalThis, 'fetch', {
  value: refuseFetch,
});

for (const [owner, name] of [
  [
    globalThis,
    'WebSocket',
  ],
  [
    Bun,
    'SQL',
  ],
] as const) {
  Object.defineProperty(owner, name, {
    value: refuseNetwork,
  });
}

Bun.connect = refuseNetwork;
net.Socket.prototype.connect = refuseNetwork;
net.connect = refuseNetwork;
net.createConnection = refuseNetwork;
tls.connect = refuseNetwork;

for (const client of [
  http,
  https,
]) {
  client.request = refuseNetwork;
  client.get = refuseNetwork;
}
