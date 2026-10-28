import { describe, expect, it } from 'bun:test';

import { miseBinary } from './mise.fixtures';
import { loadOf } from './preset-load.fixtures';

const BASE =
  'FROM alpine:3.22@sha256:4bcff63911fcb4448bd4fdacec207030997caf25e9bea4045fa6c8c44de311d1';
const RUN_AS = 'USER 65534\nCMD ["true"]\n';
const DOCKERFILE = 'Dockerfile';
const RULE_CODE = /\b(?:DL|SC)\d{4}\b/g;

interface Lint {
  readonly codes: readonly string[];
  readonly status: number;
}

const lintIn = async (dockerfile: string): Promise<Lint> => {
  const { output, status } = await loadOf('hadolint', {
    command: [
      miseBinary('hadolint'),
      DOCKERFILE,
    ],
    files: {
      [DOCKERFILE]: dockerfile,
    },
  });

  return {
    codes: output.flatMap((line) => line.match(RULE_CODE) ?? []),
    status,
  };
};

// Why: hadolint skips a key or a rule it does not know, and only prints, never fails, on a
// configuration it cannot read, so each setting the presets write has a sample it must react to.
describe("the configuration hadolint's presets write", () => {
  it('should load in hadolint when a unit follows every block hadolint is configured for', async () => {
    // Act
    const load = await loadOf('hadolint', {
      command: [
        miseBinary('hadolint'),
        DOCKERFILE,
      ],
      files: {
        [DOCKERFILE]: `${BASE}\n${RUN_AS}`,
      },
    });

    // Assert
    expect(load).toStrictEqual({
      output: [],
      status: 0,
    });
  });

  it.each([
    {
      codes: [
        'DL3048',
      ],
      condition: 'a label breaks a rule of the style level, the level the failure threshold names',
      dockerfile: `${BASE}\nLABEL com.example..kind=order\n${RUN_AS}`,
      status: 1,
    },
    {
      codes: [],
      condition: 'a copied archive is unpacked by a command, which DL3010 would report',
      dockerfile: `${BASE}\nCOPY site.tar.gz /srv/\nRUN tar -xzf /srv/site.tar.gz -C /srv\n${RUN_AS}`,
      status: 0,
    },
  ])('should report $codes when $condition', async ({ codes, dockerfile, status }) => {
    // Act
    const lint = await lintIn(dockerfile);

    // Assert
    expect(lint).toStrictEqual({
      codes,
      status,
    });
  });
});
