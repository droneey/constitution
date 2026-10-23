import { describe, expect, it } from 'bun:test';

import type { Reminder } from '../../../../../domain/entities';
import { commandLineOf, createFakeCommandRun } from '../../../../__tests__/command-line.fake';
import { createPostToolUseCommand } from '../post-tool-use.cli';

interface Asked {
  agent: string;
  path: string;
  session: string;
}

interface Added {
  agent: string;
  ids: readonly string[];
  session: string;
}

const EDIT =
  '{"session_id":"session-1","agent_id":"agent-7","tool_name":"Edit","tool_input":{"file_path":"/work/src/ui/page.tsx"}}';

describe('createPostToolUseCommand', () => {
  it.each([
    {
      condition: 'the tool names a file',
      path: '/work/src/ui/page.tsx',
      stdin: EDIT,
    },
    {
      condition: 'the tool names a notebook',
      path: '/work/notes.ipynb',
      stdin:
        '{"session_id":"session-1","agent_id":"agent-7","tool_input":{"notebook_path":"/work/notes.ipynb"}}',
    },
  ])('should ask for the reminder of the path when $condition', async ({ path, stdin }) => {
    // Arrange
    const fake = createFakeCommandRun({
      stdin,
    });
    let asked: readonly Asked[] = [];
    const cli = await commandLineOf(
      createPostToolUseCommand({
        ...fake.run,
        addReminded: (): void => {
          // nothing is reminded when no reminder is given
        },
        remindFile: (question: Asked): undefined => {
          asked = [
            ...asked,
            question,
          ];
        },
      }),
    );

    // Act
    await cli.run([
      'post-tool-use',
    ]);

    // Assert
    expect({
      asked,
      record: fake.record(),
    }).toStrictEqual({
      asked: [
        {
          agent: 'agent-7',
          path,
          session: 'session-1',
        },
      ],
      record: {
        errors: [],
        failures: 0,
        prefixes: [
          'constitution hook',
        ],
        written: [],
      },
    });
  });

  it.each([
    {
      condition: 'no block governs the file',
      reminder: undefined,
    },
    {
      condition: 'every block that governs it was named',
      reminder: {
        ids: [
          'ui',
        ],
        notes: [],
      },
    },
  ])('should note nothing and write nothing when $condition', async ({ reminder }) => {
    // Arrange
    const fake = createFakeCommandRun({
      stdin: EDIT,
    });
    let added: readonly Added[] = [];
    const cli = await commandLineOf(
      createPostToolUseCommand({
        ...fake.run,
        addReminded: (reminded: Added): void => {
          added = [
            ...added,
            reminded,
          ];
        },
        remindFile: (): Reminder | undefined => reminder,
      }),
    );

    // Act
    await cli.run([
      'post-tool-use',
    ]);

    // Assert
    expect({
      added,
      written: fake.record().written,
    }).toStrictEqual({
      added: [],
      written: [],
    });
  });

  it('should note the blocks named and give their notes as the event context when blocks govern the file', async () => {
    // Arrange
    const fake = createFakeCommandRun({
      stdin: EDIT,
    });
    let added: readonly Added[] = [];
    const cli = await commandLineOf(
      createPostToolUseCommand({
        ...fake.run,
        addReminded: (reminded: Added): void => {
          added = [
            ...added,
            reminded,
          ];
        },
        remindFile: (): Reminder => ({
          ids: [
            'ui',
            'react',
          ],
          notes: [
            'ui governs it: read blocks/domains/ui/ui.md',
            'react governs it',
          ],
        }),
      }),
    );

    // Act
    await cli.run([
      'post-tool-use',
    ]);

    // Assert
    expect({
      added,
      written: fake.record().written,
    }).toStrictEqual({
      added: [
        {
          agent: 'agent-7',
          ids: [
            'ui',
            'react',
          ],
          session: 'session-1',
        },
      ],
      written: [
        '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"ui governs it: read blocks/domains/ui/ui.md\\nreact governs it"}}\n',
      ],
    });
  });
});
