import type { PluginRow } from './ast-grep-plugins.fixtures';

const DIGEST = '0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d';

const formatsPluginRows: readonly PluginRow[] = [
  {
    language: 'json',
    slug: 'utc-instant-ends-in-z',
    unit: {
      axes: [],
      blocks: [
        'json',
      ],
    },
    reported: [
      {
        condition: 'an instant at offset zero ends in +00:00',
        files: {
          'data/order.json':
            '{\n  "orderId": "ord_1042",\n  "placedAt": "2026-11-08T14:30:00+00:00",\n  "paidAt": "2026-11-08T14:31:12Z"\n}\n',
        },
      },
      {
        condition: 'an instant with a fraction ends in -00:00',
        files: {
          'data/order.json': '{\n  "paidAt": "2026-11-08T14:31:12.250-00:00"\n}\n',
        },
      },
      {
        condition: 'an instant ends in a lower-case z',
        files: {
          'data/order.json': '{\n  "paidAt": "2026-11-08T14:31:12z"\n}\n',
        },
      },
      {
        condition: 'a file of json with comments holds an instant at +00:00',
        files: {
          'data/order.jsonc':
            '{\n  // Why: the payment provider sets it.\n  "paidAt": "2026-11-08T14:31:12+00:00"\n}\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'every instant at offset zero ends in z',
        files: {
          'data/order.json':
            '{\n  "orderId": "ord_1042",\n  "placedAt": "2026-11-08T14:30:00Z",\n  "paidAt": "2026-11-08T14:31:12Z"\n}\n',
        },
      },
      {
        condition: 'a time a person sets carries its zone after its offset',
        files: {
          'data/meeting.json': '{\n  "startsAt": "2026-12-01T10:00:00+00:00[Europe/London]"\n}\n',
        },
      },
      {
        condition: 'an instant keeps an offset other than zero',
        files: {
          'data/order.json': '{\n  "placedAt": "2026-11-08T16:30:00+02:00"\n}\n',
        },
      },
      {
        condition: 'a text only mentions an instant',
        files: {
          'data/order.json': '{\n  "note": "placed at 2026-11-08T14:30:00+00:00 by phone"\n}\n',
        },
      },
    ],
  },
  {
    language: 'shell',
    slug: 'temporary-file-removed-by-an-exit-trap',
    unit: {
      axes: [],
      blocks: [
        'shell',
      ],
    },
    reported: [
      {
        condition: 'no trap follows the file mktemp makes',
        files: {
          'scripts/invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n\nmain() {\n  local work_dir\n  work_dir="$(mktemp -d)"\n  render-invoices --into "$work_dir"\n  tar -czf invoices.tar.gz -C "$work_dir" .\n  rm -rf -- "$work_dir"\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'a command stands between mktemp and its trap',
        files: {
          'scripts/invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n\nmain() {\n  local work_dir\n  work_dir="$(mktemp -d)"\n  render-invoices --into "$work_dir"\n  trap \'rm -rf -- "$work_dir"\' EXIT\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'a posix script traps only exit',
        files: {
          'scripts/invoices.sh':
            '#!/bin/sh\nset -eu\n\nwork_dir="$(mktemp -d)"\ntrap \'rm -rf -- "$work_dir"\' EXIT\nrender-invoices --into "$work_dir"\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a trap on exit follows mktemp past a comment',
        files: {
          'scripts/invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n\nmain() {\n  local work_dir\n  work_dir="$(mktemp -d)"\n  # shellcheck disable=SC2064 # Why: expanded now, since work_dir is gone once main returns\n  trap "rm -rf -- \'$work_dir\'" EXIT\n  render-invoices --into "$work_dir"\n  tar -czf invoices.tar.gz -C "$work_dir" .\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'the trap is set in the statement that makes the file',
        files: {
          'scripts/invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n\nmain() {\n  local work_dir\n  work_dir="$(mktemp -d)" && trap \'rm -rf -- "$work_dir"\' EXIT\n  render-invoices --into "$work_dir"\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'a posix script also traps hup int and term',
        files: {
          'scripts/invoices.sh':
            '#!/bin/sh\nset -eu\n\nwork_dir="$(mktemp -d)"\ntrap \'rm -rf -- "$work_dir"\' EXIT\ntrap \'exit 1\' HUP INT TERM\nrender-invoices --into "$work_dir"\n',
        },
      },
      {
        condition: 'mktemp only prints a name',
        files: {
          'scripts/invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n\nmain() {\n  local pipe_name\n  pipe_name="$(mktemp -u)"\n  mkfifo -- "$pipe_name"\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'a sourced file makes the temporary file',
        files: {
          'scripts/lib/work-dir.sh': 'make_work_dir() {\n  mktemp -d\n}\n',
        },
      },
    ],
  },
  {
    language: 'shell',
    slug: 'unset-variable-fails-the-script',
    unit: {
      axes: [],
      blocks: [
        'shell',
      ],
    },
    reported: [
      {
        condition: 'the script never turns on set -u',
        files: {
          'scripts/release.sh':
            '#!/usr/bin/env bash\nset -eo pipefail\nshopt -s inherit_errexit\n\nmain() {\n  rm -rf -- "$RELEASE_DIR/build"\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'a declaration runs before set -u',
        files: {
          'scripts/release.sh':
            '#!/usr/bin/env bash\nreadonly BUILD_DIR="$RELEASE_DIR/build"\nset -euo pipefail\n\nmain() {\n  rm -rf -- "$BUILD_DIR"\n}\n\nmain "$@"\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'set -u opens the script among its options',
        files: {
          'scripts/release.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\nshopt -s inherit_errexit\n\nmain() {\n  rm -rf -- "$RELEASE_DIR/build"\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'nounset is set by its name after the check of the version',
        files: {
          'scripts/release.sh':
            '#!/usr/bin/env bash\nset -eo pipefail\nif ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then\n  shopt -s inherit_errexit\nfi\nset -o nounset\n\nmain() {\n  rm -rf -- "$RELEASE_DIR/build"\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'an expansion gives its own default',
        files: {
          'scripts/release.sh':
            '#!/bin/sh\nset -eu\n\nrelease_dir="${RELEASE_DIR:-dist}"\nrm -rf -- "$release_dir/build"\n',
        },
      },
      {
        condition: 'a sourced file holds no interpreter line',
        files: {
          'scripts/lib/paths.sh': 'build_dir="$RELEASE_DIR/build"\n',
        },
      },
    ],
  },
  {
    language: 'shell',
    slug: 'script-logic-in-a-main-function',
    unit: {
      axes: [],
      blocks: [
        'shell',
      ],
    },
    reported: [
      {
        condition: 'a loop runs outside main',
        files: {
          'scripts/send-invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\nshopt -s inherit_errexit\n\nsend_invoice() {\n  local invoice_id="$1"\n  render-invoice "$invoice_id" | mail-invoice --to-customer\n}\n\nfor invoice_id in "$@"; do\n  send_invoice "$invoice_id"\ndone\n',
        },
      },
      {
        condition: 'a command follows the call of main',
        files: {
          'scripts/send-invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n\nmain() {\n  mail-invoices "$@"\n}\n\nmain "$@"\nexit 0\n',
        },
      },
      {
        condition: 'a value is computed outside main',
        files: {
          'scripts/send-invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\nreadonly OUTBOX="$(mail-outbox)"\n\nmain() {\n  mail-invoices --outbox "$OUTBOX" "$@"\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'the last line calls main without its arguments',
        files: {
          'scripts/send-invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n\nmain() {\n  mail-invoices\n}\n\nmain\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'main runs the logic and the last line calls it',
        files: {
          'scripts/send-invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\nif ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then\n  shopt -s inherit_errexit\nfi\n\nreadonly MAILER=\'mail-invoice\'\n\nsend_invoice() {\n  local invoice_id="$1"\n  render-invoice "$invoice_id" | "$MAILER" --to-customer\n}\n\nmain() {\n  local invoice_id\n  for invoice_id in "$@"; do\n    send_invoice "$invoice_id"\n  done\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'the script defines no function',
        files: {
          'scripts/send-invoices.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n\nmail-invoices "$@"\n',
        },
      },
      {
        condition: 'a sourced file runs a command beside its functions',
        files: {
          'scripts/lib/mail.sh':
            'send_invoice() {\n  mail-invoice "$1"\n}\n\nexport MAILER=mail-invoice\nmail-check\n',
        },
      },
    ],
  },
  {
    language: 'shell',
    slug: 'xtrace-never-ships',
    unit: {
      axes: [],
      blocks: [
        'shell',
      ],
    },
    reported: [
      {
        condition: 'set turns the trace on among its flags',
        files: {
          'scripts/payouts.sh':
            '#!/usr/bin/env bash\nset -euxo pipefail\nshopt -s inherit_errexit\n\npayments_token="$(vault kv get -field=token secret/payments)"\nfetch-payouts | PAYMENTS_TOKEN="$payments_token" settle-payouts\n',
        },
      },
      {
        condition: 'a function turns xtrace on by its name',
        files: {
          'scripts/payouts.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n\nmain() {\n  set -o xtrace\n  settle-payouts\n}\n\nmain "$@"\n',
        },
      },
      {
        condition: 'a condition turns the trace on',
        files: {
          'scripts/payouts.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n[[ -n "${DEBUG:-}" ]] && set -x\nsettle-payouts\n',
        },
      },
      {
        condition: 'shopt turns xtrace on',
        files: {
          'scripts/payouts.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\nshopt -s -o xtrace\nsettle-payouts\n',
        },
      },
      {
        condition: 'the interpreter line passes -x',
        files: {
          'scripts/payouts.sh': '#!/bin/sh -ex\nsettle-payouts\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the script runs without the trace',
        files: {
          'scripts/payouts.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\nshopt -s inherit_errexit\n\npayments_token="$(vault kv get -field=token secret/payments)"\nfetch-payouts | PAYMENTS_TOKEN="$payments_token" settle-payouts\n',
        },
      },
      {
        condition: 'set turns the trace off',
        files: {
          'scripts/payouts.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\nset +x\nshopt -u -o xtrace\n',
        },
      },
      {
        condition: 'set takes -x as an argument after its options end',
        files: {
          'scripts/payouts.sh': '#!/usr/bin/env bash\nset -euo pipefail\nset -- -x "$@"\n',
        },
      },
    ],
  },
  {
    language: 'shell',
    slug: 'shellcheck-reason-in-a-comment-of-its-own',
    unit: {
      axes: [],
      blocks: [
        'shell',
        'shellcheck',
      ],
    },
    reported: [
      {
        condition: 'the reason follows the codes inside the directive',
        files: {
          'scripts/run-api.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n# shellcheck disable=SC2086 DOCKER_FLAGS holds several flags\ndocker run $DOCKER_FLAGS shop-api:base\n',
        },
      },
      {
        condition: 'a disable gives no reason',
        files: {
          'scripts/run-api.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n# shellcheck disable=SC2086\ndocker run $DOCKER_FLAGS shop-api:base\n',
        },
      },
      {
        condition: 'a disable stands right under the interpreter line',
        files: {
          'scripts/run-api.sh':
            '#!/usr/bin/env bash\n# shellcheck disable=SC2086\ndocker run $DOCKER_FLAGS shop-api:base\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the reason follows a second hash',
        files: {
          'scripts/run-api.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n# shellcheck disable=SC2086 # Why: DOCKER_FLAGS holds several flags, each one word.\ndocker run $DOCKER_FLAGS shop-api:base\n',
        },
      },
      {
        condition: 'the reason stands on the line above',
        files: {
          'scripts/run-api.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n# Why: DOCKER_FLAGS holds several flags, each one word.\n# shellcheck disable=SC2086\ndocker run $DOCKER_FLAGS shop-api:base\n',
        },
      },
      {
        condition: 'a directive only names the file it sources',
        files: {
          'scripts/run-api.sh':
            '#!/usr/bin/env bash\nset -euo pipefail\n# shellcheck source=scripts/lib/docker.sh\nsource ./lib/docker.sh\n',
        },
      },
    ],
  },
  {
    language: 'yaml',
    slug: 'value-holding-a-backslash-never-double-quoted',
    unit: {
      axes: [],
      blocks: [
        'yaml',
      ],
    },
    reported: [
      {
        condition: 'a pattern of word boundaries is double-quoted',
        files: {
          'deploy/redaction.yaml': 'redaction:\n  patterns:\n    - "\\bcard\\b"\n',
        },
      },
      {
        condition: 'a pattern of a class of Unicode letters is double-quoted',
        files: {
          'deploy/redaction.yaml': 'redaction:\n  patterns:\n    - "\\P{L}+"\n',
        },
      },
      {
        condition: 'a path escapes its backslashes in double quotes',
        files: {
          'deploy/backup.yaml': 'target: "C:\\\\Backups\\\\orders"\n',
        },
      },
      {
        condition: 'a double-quoted key holds a form feed escape',
        files: {
          'deploy/redaction.yaml': '"\\fpage": break\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the pattern is single-quoted',
        files: {
          'deploy/redaction.yaml': "redaction:\n  patterns:\n    - '\\bcard\\b'\n",
        },
      },
      {
        condition: 'the pattern is plain or a block scalar',
        files: {
          'deploy/redaction.yaml':
            'redaction:\n  patterns:\n    - \\bcard\\b\n  note: |\n    \\biban\\b\n',
        },
      },
      {
        condition: 'double quotes escape a line break a tab a quote and a code point',
        files: {
          'deploy/notice.yaml': 'notice: "Orders ship\\non \\"Monday\\"\\tat 9 \\u00e0 Paris"\n',
        },
      },
    ],
  },
  {
    language: 'yaml',
    slug: 'yaml-file-ends-in-yaml',
    unit: {
      axes: [],
      blocks: [
        'yaml',
      ],
    },
    reported: [
      {
        condition: 'a file ends in yml',
        files: {
          'deploy/orders.yml': 'replicas: 2\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'every file ends in yaml',
        files: {
          'deploy/invoices.yaml': 'replicas: 2\n',
          'deploy/orders.yaml': 'replicas: 4\n',
        },
      },
      {
        condition: 'a tool reads the file only by its fixed name',
        files: {
          'bitbucket-pipelines.yml': 'image: node:22.11.0\n',
        },
      },
    ],
  },
  {
    language: 'yaml',
    slug: 'merge-key-never-used',
    unit: {
      axes: [],
      blocks: [
        'yaml',
      ],
    },
    reported: [
      {
        condition: 'a mapping merges an anchored one',
        files: {
          'deploy/services.yaml':
            'defaults: &defaults\n  replicas: 2\n  memory: 512Mi\norders:\n  <<: *defaults\n  replicas: 4\ninvoices:\n  <<: *defaults\n',
        },
      },
      {
        condition: 'a flow mapping merges an anchored one',
        files: {
          'deploy/services.yaml': 'defaults: &defaults\n  replicas: 2\norders: {<<: *defaults}\n',
        },
      },
    ],
    allowed: [
      {
        condition:
          'a Bitbucket Pipelines file, whose reader defines the key, merges an anchored step',
        files: {
          'bitbucket-pipelines.yml':
            'definitions:\n  steps:\n    - step: &build\n        name: Build\npipelines:\n  default:\n    - step:\n        <<: *build\n',
        },
      },
      {
        condition: 'each mapping writes its keys out',
        files: {
          'deploy/services.yaml':
            'orders:\n  replicas: 4\n  memory: 512Mi\ninvoices:\n  replicas: 2\n  memory: 512Mi\n',
        },
      },
      {
        condition: 'a quoted key only spells the merge key',
        files: {
          'deploy/operators.yaml': 'operators:\n  "<<": shift-left\n',
        },
      },
      {
        condition: 'a compose file merges an anchored mapping',
        files: {
          'docker/app.yaml':
            'x-logging: &logging\n  driver: local\nservices:\n  api:\n    image: shop-api:2.4.0\n    logging:\n      <<: *logging\n',
        },
      },
    ],
  },
  {
    language: 'yaml',
    slug: 'service-image-checked-against-its-digest',
    unit: {
      axes: [],
      blocks: [
        'yaml',
        'compose',
      ],
    },
    reported: [
      {
        condition: 'an image names its version alone',
        files: {
          'compose.yaml':
            "services:\n  cache:\n    image: valkey/valkey:8.0.2\n    security_opt:\n      - 'no-new-privileges:true'\n",
        },
      },
      {
        condition: 'an image names its digest alone',
        files: {
          'compose.yaml': `services:\n  cache:\n    image: valkey/valkey@sha256:${DIGEST}\n`,
        },
      },
      {
        condition: 'a service builds its image but pulls it',
        files: {
          'compose.dev.yaml':
            'services:\n  shop-api:\n    build: .\n    image: registry.shop.example/shop-api:2.4.0\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'an image names its version and its digest',
        files: {
          'compose.yaml': `services:\n  cache:\n    image: valkey/valkey:8.0.2@sha256:${DIGEST}\n  db:\n    image: 'registry.shop.example:5000/postgres:17.2@sha256:${DIGEST}'\n`,
        },
      },
      {
        condition: 'a service builds the image it names under pull_policy build',
        files: {
          'compose.yaml':
            'services:\n  shop-api:\n    build: .\n    image: registry.shop.example/shop-api:2.4.0\n    pull_policy: build\n',
        },
      },
      {
        condition: 'an extension field names an image',
        files: {
          'compose.yaml': `x-defaults:\n  image: valkey/valkey:8.0.2\nservices:\n  cache:\n    image: valkey/valkey:8.0.2@sha256:${DIGEST}\n`,
        },
      },
    ],
  },
  {
    language: 'yaml',
    slug: 'dclint-disable-line-comment',
    unit: {
      axes: [],
      blocks: [
        'yaml',
        'compose',
        'dclint',
      ],
    },
    reported: [
      {
        condition: 'a comment disables dclint for the file',
        files: {
          'compose.yaml':
            '# dclint disable\nservices:\n  shop-api:\n    build: .\n    image: registry.shop.example/shop-api:2.4.0\n    pull_policy: build\n',
        },
      },
      {
        condition: 'a disable-line names no rule',
        files: {
          'compose.yaml':
            'services:\n  shop-api:\n    build: .\n    image: registry.shop.example/shop-api:2.4.0 # dclint disable-line\n    pull_policy: build\n',
        },
      },
      {
        condition: 'a disable-line names two rules',
        files: {
          'compose.yaml':
            'services:\n  shop-api:\n    build: .\n    image: registry.shop.example/shop-api:2.4.0 # dclint disable-line no-build-and-image, require-project-name-field\n    pull_policy: build\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a disable-line on the line it silences names its rule',
        files: {
          'compose.yaml':
            'services:\n  shop-api:\n    build: .\n    # Why: the build tags the image the release pushes\n    image: registry.shop.example/shop-api:2.4.0 # dclint disable-line no-build-and-image\n    pull_policy: build\n',
        },
      },
      {
        condition: 'a disable-line stands alone above the line it silences',
        files: {
          'compose.yaml':
            'services:\n  shop-api:\n    build: .\n    # dclint disable-line no-build-and-image\n    image: registry.shop.example/shop-api:2.4.0\n    pull_policy: build\n',
        },
      },
    ],
  },
  {
    language: 'yaml',
    slug: 'yamllint-reason-on-the-line-above',
    unit: {
      axes: [],
      blocks: [
        'yaml',
        'yamllint',
      ],
    },
    reported: [
      {
        condition: 'the reason follows the rule on the suppression line',
        files: {
          'deploy/release.yaml':
            'release: 2.4.0\nsignature: signed-by-the-release-key-of-the-shop-for-version-two-four-zero-on-the-eighth-of-november  # yamllint disable-line rule:line-length -- a signature cannot wrap\n',
        },
      },
      {
        condition: 'a key stands on the line above the suppression',
        files: {
          'deploy/release.yaml':
            'release: 2.4.0\n# yamllint disable-line rule:line-length\nsignature: signed-by-the-release-key-of-the-shop-for-version-two-four-zero-on-the-eighth-of-november\n',
        },
      },
      {
        condition: 'the suppression opens the file',
        files: {
          'deploy/release.yaml':
            '# yamllint disable-line rule:line-length\nsignature: signed-by-the-release-key-of-the-shop-for-version-two-four-zero-on-the-eighth-of-november\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'the reason stands on the line above the suppression',
        files: {
          'deploy/release.yaml':
            'release: 2.4.0\n# Why: a signature is one token, which cannot wrap.\n# yamllint disable-line rule:line-length\nsignature: signed-by-the-release-key-of-the-shop-for-version-two-four-zero-on-the-eighth-of-november\n',
        },
      },
      {
        condition: 'the reason stands above the line a suppression ends',
        files: {
          'deploy/release.yaml':
            'release: 2.4.0\n# Why: a signature is one token, which cannot wrap.\nsignature: signed-by-the-release-key-of-the-shop-for-version-two-four-zero-on-the-eighth-of-november  # yamllint disable-line rule:line-length\n',
        },
      },
    ],
  },
];

export { formatsPluginRows };
