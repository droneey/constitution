import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';

// A declaration, not an arrow, so that `new WebSocket()` and `new Bun.SQL()` throw this error too.
function refuseNetwork(): never {
  throw new Error('A spec reached the network: give it the fake of its transport');
}

for (const [owner, name] of [
  [
    globalThis,
    'fetch',
  ],
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
