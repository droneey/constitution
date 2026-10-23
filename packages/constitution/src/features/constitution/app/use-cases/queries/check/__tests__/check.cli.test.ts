import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel/types';

import type { ProjectWarning } from '../../../../../domain/entities';
import { WarningCode } from '../../../../../domain/entities';
import { commandLineOf, createFakeCommandRun } from '../../../../__tests__/command-line.fake';
import { createCheckCommand } from '../check.cli';

interface Validated {
  base: string | undefined;
  root: string;
}

describe('createCheckCommand', () => {
  it.each([
    {
      advice: [
        'advice: name the check',
      ],
      condition: 'the folder holds sound blocks in a sound project',
      failures: 0,
      findings: [],
      holdsBlocks: true,
      warnings: [],
      written: [
        'blocks: every block is sound\nadvice: name the check\n',
        'project: constitution.yaml and its wiring are sound\n',
      ],
    },
    {
      advice: [],
      condition: 'the blocks have findings',
      failures: 1,
      findings: [
        {
          code: 'missing-why',
          message: 'a rule has no Why',
          path: 'blocks/core/core.md',
        },
        {
          code: 'broken-link',
          message: 'a link leads nowhere',
          path: 'README.md',
        },
      ],
      holdsBlocks: true,
      warnings: undefined,
      written: [
        'blocks/core/core.md: a rule has no Why [missing-why]\nREADME.md: a link leads nowhere [broken-link]\nblocks: 2 finding(s)\n',
      ],
    },
    {
      advice: [],
      condition: 'the folder holds no blocks and its project has warnings',
      failures: 1,
      findings: [
        {
          code: 'unseen',
          message: 'never checked',
          path: 'blocks/core/core.md',
        },
      ],
      holdsBlocks: false,
      warnings: [
        {
          code: WarningCode.Unknown,
          message: 'open-source is not a block',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no version key',
        },
      ],
      written: [
        '- unknown: open-source is not a block\n- config: constitution.yaml has no version key\nproject: 2 warning(s)\n',
      ],
    },
    {
      advice: [],
      condition: 'the folder holds no blocks and no project is around it',
      failures: 0,
      findings: [],
      holdsBlocks: false,
      warnings: undefined,
      written: [],
    },
  ])(
    'should write what it checked and fail on a finding or a warning when $condition',
    async ({ advice, failures, findings, holdsBlocks, warnings, written }) => {
      // Arrange
      const fake = createFakeCommandRun();
      let asked: readonly string[] = [];
      const cli = await commandLineOf(
        createCheckCommand({
          ...fake.run,
          checkProject: (start: string): readonly ProjectWarning[] | undefined => {
            asked = [
              ...asked,
              `project ${start}`,
            ];

            return warnings;
          },
          holdsBlocks: (folder: string): boolean => {
            asked = [
              ...asked,
              `blocks ${folder}`,
            ];

            return holdsBlocks;
          },
          validateConstitution: (): {
            advice: readonly string[];
            findings: readonly Finding[];
          } => ({
            advice,
            findings,
          }),
        }),
      );

      // Act
      await cli.run([
        'check',
      ]);

      // Assert
      expect({
        asked,
        record: fake.record(),
      }).toStrictEqual({
        asked: [
          'blocks /work/package',
          'project /work/package',
        ],
        record: {
          errors: [],
          failures,
          prefixes: [
            'constitution check',
          ],
          written,
        },
      });
    },
  );

  it.each([
    {
      argv: [
        'check',
        '--base',
        '.droneey/constitution',
      ],
      base: '.droneey/constitution',
      condition: 'a base is given',
    },
    {
      argv: [
        'check',
      ],
      base: undefined,
      condition: 'none is given',
    },
  ])(
    'should check the blocks of the folder it runs in over the base when $condition',
    async ({ argv, base }) => {
      // Arrange
      const fake = createFakeCommandRun();
      let validated: readonly Validated[] = [];
      const cli = await commandLineOf(
        createCheckCommand({
          ...fake.run,
          checkProject: (): undefined => undefined,
          holdsBlocks: (): boolean => true,
          validateConstitution: (asked: Validated) => {
            validated = [
              ...validated,
              asked,
            ];

            return {
              advice: [],
              findings: [],
            };
          },
        }),
      );

      // Act
      await cli.run([
        ...argv,
      ]);

      // Assert
      expect(validated).toStrictEqual([
        {
          base,
          root: '/work/package',
        },
      ]);
    },
  );
});
