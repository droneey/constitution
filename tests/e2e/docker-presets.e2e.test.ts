import { describe, expect, it } from 'bun:test';

import { lintCompose, lintDockerfile } from './docker-presets.fixtures';

const DOCKERFILE = [
  'FROM node:24.8.0-bookworm-slim',
  'SHELL ["/bin/bash", "-o", "pipefail", "-c"]',
  'RUN apt-get update \\',
  '  && apt-get install -y --no-install-recommends curl=7.88.1-10+deb12u12 \\',
  '  && rm -rf /var/lib/apt/lists/*',
  'COPY . /app',
  'USER 1000',
  'CMD ["node", "/app/main.js"]',
  '',
].join('\n');

const COMPOSE = [
  'name: shop',
  '',
  'x-logging: &logging',
  '  driver: json-file',
  '',
  'services:',
  '  _api:',
  '    image: shop/api:1.4.0',
  '    profiles: [do-not-use]',
  '    restart: unless-stopped',
  '    ports:',
  "      - '127.0.0.1:3000:3000'",
  '    logging: *logging',
  '    environment:',
  '      NODE_ENV: production',
  '  api-development:',
  '    extends: _api',
  '    profiles: [development]',
  '    depends_on:',
  '      db:',
  '        condition: service_healthy',
  '  db:',
  '    image: postgres:17.2',
  '    healthcheck:',
  "      test: ['CMD', 'pg_isready']",
  '',
].join('\n');

describe('the hadolint docker part', () => {
  it('should report nothing when a Dockerfile follows the docker block', () => {
    // Arrange
    const text = DOCKERFILE;

    // Act
    const lint = lintDockerfile(text);

    // Assert
    expect(lint).toStrictEqual({
      codes: [],
      exitCode: 0,
    });
  });

  it.each([
    {
      code: 'DL3007',
      condition: 'the base image is latest',
      from: 'FROM node:24.8.0-bookworm-slim',
      to: 'FROM node:latest',
    },
    {
      code: 'DL3006',
      condition: 'the base image has no tag',
      from: 'FROM node:24.8.0-bookworm-slim',
      to: 'FROM node',
    },
    {
      code: 'DL3020',
      condition: 'files enter with ADD',
      from: 'COPY . /app',
      to: 'ADD . /app',
    },
    {
      code: 'DL3025',
      condition: 'the command is in shell form',
      from: 'CMD ["node", "/app/main.js"]',
      to: 'CMD node /app/main.js',
    },
    {
      code: 'DL3008',
      condition: 'a system package has no version',
      from: 'curl=7.88.1-10+deb12u12',
      to: 'curl',
    },
    {
      code: 'DL3015',
      condition: 'recommended packages come along',
      from: '--no-install-recommends ',
      to: '',
    },
    {
      code: 'DL4006',
      condition: 'a piped step runs without pipefail',
      from: 'SHELL ["/bin/bash", "-o", "pipefail", "-c"]\n',
      to: 'RUN curl -s https://example.com | tee /tmp/page\n',
    },
  ])('should fail with $code when $condition', ({ code, from, to }) => {
    // Arrange
    const text = DOCKERFILE.replace(from, to);

    // Act
    const lint = lintDockerfile(text);

    // Assert
    expect(lint).toStrictEqual({
      codes: [
        code,
      ],
      exitCode: 1,
    });
  });
});

describe('the dclint docker part', () => {
  it('should report nothing when a Compose file follows the docker block', () => {
    // Arrange
    const text = COMPOSE;

    // Act
    const lint = lintCompose(text);

    // Assert
    expect(lint).toStrictEqual({
      codes: [],
      exitCode: 0,
    });
  });

  it.each([
    {
      condition: 'the file carries a version',
      from: 'name: shop\n',
      rule: 'no-version-field',
      to: "version: '3.9'\nname: shop\n",
    },
    {
      condition: 'the volumes come before the services',
      from: 'services:\n',
      rule: 'top-level-properties-order',
      to: 'volumes:\n  data:\n\nservices:\n',
    },
    {
      condition: 'a service lists its environment before its ports',
      from: "    ports:\n      - '127.0.0.1:3000:3000'\n    logging: *logging\n    environment:\n      NODE_ENV: production\n",
      rule: 'service-keys-order',
      to: "    environment:\n      NODE_ENV: production\n    ports:\n      - '127.0.0.1:3000:3000'\n",
    },
    {
      condition: 'an image has no tag',
      from: 'image: postgres:17.2',
      rule: 'service-image-require-explicit-tag',
      to: 'image: postgres',
    },
    {
      condition: 'a published address names no interface',
      from: "'127.0.0.1:3000:3000'",
      rule: 'no-unbound-port-interfaces',
      to: "'3000:3000'",
    },
    {
      condition: 'a published address is not quoted',
      from: "'127.0.0.1:3000:3000'",
      rule: 'require-quotes-in-ports',
      to: '127.0.0.1:3000:3000',
    },
  ])('should fail with $rule when $condition', ({ from, rule, to }) => {
    // Arrange
    const text = COMPOSE.replace(from, to);

    // Act
    const lint = lintCompose(text);

    // Assert
    expect(lint).toStrictEqual({
      codes: [
        rule,
      ],
      exitCode: 1,
    });
  });
});
