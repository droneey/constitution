import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';

import type { Files } from '../../../../../__tests__/constitution.fixtures';
import { without } from '../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../../../../application/use-cases/queries/check/__tests__/check.fixtures';
import type { ManifestReadDetails } from '../../../../entities';
import { ManifestReadCode } from '../../../../entities';
import type { HooksDetails } from '../hooks';
import { HooksCode, hooksCheck } from '../hooks';

const HOOKS = 'hooks/hooks.json';
const SESSION_START_HOOK =
  '{"hooks":{"SessionStart":[{"hooks":[{"type":"command","command":"sh \\"${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh\\""}]}]}}';

interface ManifestCase {
  expected: FindingOf<HooksDetails & ManifestReadDetails>[];
  files: Files;
  name: string;
}

const withFiles = (extra: Readonly<Files>): Files => ({
  ...validFiles(),
  ...extra,
});

describe('hooksCheck', () => {
  it.each<ManifestCase>([
    {
      expected: [],
      files: without({
        files: validFiles(),
        path: HOOKS,
      }),
      name: 'the hooks manifest is absent',
    },
    {
      expected: [
        {
          code: HooksCode.FileMissing,
          details: {
            file: 'hooks/session-start.sh',
          },
          path: HOOKS,
        },
      ],
      files: withFiles({
        [HOOKS]: SESSION_START_HOOK,
      }),
      name: 'a hook runs a missing script',
    },
    {
      expected: [],
      files: withFiles({
        [HOOKS]: SESSION_START_HOOK,
        'hooks/session-start.sh': '#!/bin/sh\n',
      }),
      name: 'a hook runs a script that exists',
    },
    {
      expected: [
        {
          code: ManifestReadCode.OffSchema,
          details: {
            field: 'hooks',
            reason: expect.any(String),
          },
          path: HOOKS,
        },
      ],
      files: withFiles({
        [HOOKS]: '{"hooks":"none"}',
      }),
      name: 'the hooks manifest has the wrong shape',
    },
  ])('should check the hooks manifest when $name', ({ expected, files }) => {
    // Arrange
    const input = checkInputOf(files);

    // Act
    const findings = hooksCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });
});
