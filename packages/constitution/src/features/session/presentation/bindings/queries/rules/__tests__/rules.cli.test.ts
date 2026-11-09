import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { Level } from '#/kernel/constants';
import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import type { GoverningRules } from '../../../../../application/use-cases/queries/read-rules';
import type { OwedReading } from '../../../../../domain/gate/entities';
import { GateCauseKind } from '../../../../../domain/gate/entities';
import { RuleHash } from '../../../../../domain/gate/value-objects';
import { createRulesCommand } from '../rules.cli';
import { NO_RULES_MESSAGE } from '../rules.messages';

interface TextAsked {
  readonly reading: OwedReading;
  readonly withWhy: boolean;
}

const reading: OwedReading = {
  definitions: [],
  rules: [
    {
      file: AbsolutePath.create('/work/project/.droneey/constitution/blocks/core/names.md'),
      hash: RuleHash.create('0123456789abcdef'),
      level: Level.Must,
      slug: RuleSlug.create('name-reveals-intent'),
      statement: 'A name reveals intent.',
      why: 'Readers learn from names.',
    },
  ],
};

const governingOf = (input: Partial<GoverningRules> = {}): GoverningRules => ({
  causes: [],
  outside: [],
  reading,
  ...input,
});

const runOf = async (input: {
  args: readonly string[];
  governing?: GoverningRules;
}): Promise<{
  readonly asked: readonly (readonly AbsolutePath[])[];
  readonly failures: number;
  readonly stderr: string;
  readonly stdout: string;
  readonly texts: readonly TextAsked[];
}> => {
  const asked: (readonly AbsolutePath[])[] = [];
  const texts: TextAsked[] = [];
  const { context, record } = createFakeContext();

  await runCommand({
    args: input.args,
    command: createRulesCommand({
      ...context,
      readRules: (paths: readonly AbsolutePath[]): GoverningRules => {
        asked.push(paths);

        return input.governing ?? governingOf();
      },
      textOf: (text: TextAsked): string => {
        texts.push(text);

        return 'the rules';
      },
    }),
  });

  const { failures, stderr, stdout } = record();

  return {
    asked,
    failures,
    stderr,
    stdout,
    texts,
  };
};

describe('createRulesCommand', () => {
  it.each([
    {
      args: [
        '--for',
        'src/a.ts',
        '/work/other/b.ts',
      ],
      withWhy: false,
    },
    {
      args: [
        '--for',
        'src/a.ts',
        '/work/other/b.ts',
        '--why',
      ],
      withWhy: true,
    },
  ])(
    'should print the text of the rules that govern the files, from the folder it runs in, with their Why $withWhy',
    async ({ args, withWhy }) => {
      // Act
      const run = await runOf({
        args,
      });

      // Assert
      expect(run).toStrictEqual({
        asked: [
          [
            AbsolutePath.create('/work/project/package/src/a.ts'),
            AbsolutePath.create('/work/other/b.ts'),
          ],
        ],
        failures: 0,
        stderr: '',
        stdout: 'the rules\n',
        texts: [
          {
            reading,
            withWhy,
          },
        ],
      });
    },
  );

  it('should say so, and print no text, when no rule governs the files', async () => {
    // Act
    const run = await runOf({
      args: [
        '--for',
        'src/a.ts',
      ],
      governing: governingOf({
        reading: {
          definitions: [],
          rules: [],
        },
      }),
    });

    // Assert
    expect({
      stdout: run.stdout,
      texts: run.texts,
    }).toStrictEqual({
      stdout: `${NO_RULES_MESSAGE}\n`,
      texts: [],
    });
  });

  it('should fail, naming the files no project holds, and still print the rules of the others', async () => {
    // Act
    const run = await runOf({
      args: [
        '--for',
        '/elsewhere/a.ts',
      ],
      governing: governingOf({
        outside: [
          AbsolutePath.create('/elsewhere/a.ts'),
        ],
      }),
    });

    // Assert
    expect({
      failures: run.failures,
      stderr: run.stderr,
      stdout: run.stdout,
    }).toStrictEqual({
      failures: 1,
      stderr:
        'No project with a constitution.yaml holds /elsewhere/a.ts, so no rule is given for them.\n',
      stdout: 'the rules\n',
    });
  });

  it('should fail, naming why, and print no rule, when the Constitution of the project cannot be read', async () => {
    // Act
    const run = await runOf({
      args: [
        '--for',
        'src/a.ts',
      ],
      governing: governingOf({
        causes: [
          {
            kind: GateCauseKind.Failed,
            reason: 'the release cannot be listed',
          },
        ],
      }),
    });

    // Assert
    expect({
      failures: run.failures,
      stderr: run.stderr,
      stdout: run.stdout,
    }).toStrictEqual({
      failures: 1,
      stderr: 'The rules that govern these files cannot be read:\n- the release cannot be listed\n',
      stdout: '',
    });
  });
});
