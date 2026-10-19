# The context is the repository's root: the app reads the Markdown and the blocks of the whole
# repository, and installs as a member of its Bun workspace. Production serves the prerendered pages
# as files, as the static host does.

FROM oven/bun:1.4.3-alpine@sha256:629e17411f1f129dbec3af78d5af9c9f2a937435c80349437206c6b0b7422373 AS base

WORKDIR /usr/src/app

# zlib above the base image's own, which carries ALPINE-CVE-2026-85091
RUN apk add --no-cache dumb-init=1.2.5-r4 zlib=1.3.2-r1 && \
  chown 1000:1000 /usr/src/app

USER 1000

FROM base AS packages-source

COPY --chown=1000:1000 package.json bun.lock ./
COPY --chown=1000:1000 apps/docs/package.json apps/docs/
COPY --chown=1000:1000 packages/constitution/package.json packages/constitution/
COPY --chown=1000:1000 packages/mutation-check/languages/typescript/package.json packages/mutation-check/languages/typescript/

FROM packages-source AS install-dependencies

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN bun install --frozen-lockfile --ignore-scripts && \
  sha256sum bun.lock | cut -d' ' -f1 > node_modules/.bun-lock-hash

FROM install-dependencies AS builder

COPY --chown=1000:1000 ./ ./

# the release's presets, linked as mise links them on a developer's machine
RUN mkdir -p .droneey && \
  ln -sfn ../packages/constitution .droneey/constitution && \
  bun run --cwd apps/docs build

FROM install-dependencies AS development

ENV NODE_ENV=development

COPY --chown=1000:1000 ./ ./

ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "--cwd", "apps/docs", "dev", "--host"]

FROM base AS production

COPY --from=joseluisq/static-web-server:2.44.1@sha256:94618e3d17802265a21926217e6f9e7832b311b6fbf5933684001739fafed06a /static-web-server /usr/local/bin/static-web-server
COPY --chown=1000:1000 --from=builder /usr/src/app/apps/docs/.output/public ./public

ENTRYPOINT ["dumb-init", "--"]
# an address with no page gets the app shell, which shows its own not-found page
CMD ["static-web-server", "--port", "3000", "--root", "/usr/src/app/public", "--page404", "_shell.html", "--compression", "true", "--security-headers", "true", "--redirect-trailing-slash", "true", "--health", "true"]
