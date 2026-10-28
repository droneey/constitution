FROM oven/bun:1.4.3-alpine@sha256:629e17411f1f129dbec3af78d5af9c9f2a937435c80349437206c6b0b7422373 AS base

WORKDIR /usr/src/app

# Why: the base image's own zlib carries ALPINE-CVE-2026-85091.
RUN apk add --no-cache dumb-init=1.2.5-r4 zlib=1.3.2-r1 && \
  chown 1000:1000 /usr/src/app

USER 1000

FROM base AS packages-source

COPY --chown=1000:1000 package.json bun.lock ./
COPY --chown=1000:1000 apps/docs/package.json apps/docs/
COPY --chown=1000:1000 packages/constitution/package.json packages/constitution/
COPY --chown=1000:1000 packages/@design/browser/package.json packages/@design/browser/
COPY --chown=1000:1000 packages/@design/cli/package.json packages/@design/cli/
COPY --chown=1000:1000 packages/@design/tokens/package.json packages/@design/tokens/
COPY --chown=1000:1000 packages/@mutation-check/typescript/package.json packages/@mutation-check/typescript/

FROM packages-source AS install-dependencies

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN bun install --frozen-lockfile --ignore-scripts && \
  sha256sum bun.lock | cut -d' ' -f1 > node_modules/.bun-lock-hash

FROM install-dependencies AS builder

COPY --chown=1000:1000 ./ ./

# Why: Bun links no bin whose file is missing, and the first install ran before the sources came:
# this one links the design-tokens bin that each platform package's `generate` runs. The release's
# presets are linked as mise links them on a developer's machine.
RUN bun install --frozen-lockfile --ignore-scripts && \
  mkdir -p .droneey && \
  ln -sfn ../packages/constitution .droneey/constitution && \
  bun run --cwd apps/docs build

FROM install-dependencies AS development

ENV NODE_ENV=development

COPY --chown=1000:1000 ./ ./

ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "--cwd", "apps/docs", "run:dev", "--host"]

FROM base AS releases

USER 0

RUN apk add --no-cache jq=1.8.2-r0

USER 1000

ARG KEPT_RELEASES=10

COPY --chown=1000:1000 apps/docs/scripts/fetch-releases.sh packages/constitution/package.json ./
COPY --chown=1000:1000 --from=builder /usr/src/app/apps/docs/.output/public ./current

RUN --mount=type=secret,id=github_token,uid=1000 \
  KEPT_RELEASES="$KEPT_RELEASES" ./fetch-releases.sh ./current "$(jq -r .version package.json)" ./site ./server.toml

FROM base AS production

COPY --from=joseluisq/static-web-server:2.44.1@sha256:94618e3d17802265a21926217e6f9e7832b311b6fbf5933684001739fafed06a /static-web-server /usr/local/bin/static-web-server
COPY --chown=1000:1000 --from=releases /usr/src/app/site ./public
COPY --chown=1000:1000 --from=releases /usr/src/app/server.toml ./

ENTRYPOINT ["dumb-init", "--"]
CMD ["static-web-server", "--port", "3000", "--root", "/usr/src/app/public", "--page404", "404.html", "--compression", "true", "--security-headers", "true", "--redirect-trailing-slash", "true", "--health", "true", "--config-file", "/usr/src/app/server.toml"]
