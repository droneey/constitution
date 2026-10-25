import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-line.fake';
import { BlockId } from '#/kernel/value-objects';

import type { Reminder } from '../../../../../domain/entities';
import { AgentId, SessionId } from '../../../../../domain/value-objects';
import { createPostToolUseCommand } from '../post-tool-use.cli';

interface Asked {
  agent: AgentId | undefined;
  path: string;
  session: SessionId;
}

interface Recorded {
  agent: AgentId | undefined;
  ids: readonly BlockId[];
  session: SessionId;
}

interface Named extends Recorded {
  askedBefore: number;
}

const runOf = async (input: {
  reminder: Reminder | undefined;
  stdin: string;
}): Promise<{
  asked: Asked[];
  named: Named[];
  stdout: string;
}> => {
  const asked: Asked[] = [];
  const named: Named[] = [];
  const { context, record } = createFakeContext({
    stdin: input.stdin,
  });

  await runCommand({
    args: [],
    command: createPostToolUseCommand({
      ...context,
      recordReminders: (recorded: Recorded): void => {
        named.push({
          ...recorded,
          askedBefore: asked.length,
        });
      },
      remindOfFile: (file: Asked): Reminder | undefined => {
        asked.push(file);

        return input.reminder;
      },
    }),
    group: 'hook',
  });

  return {
    asked,
    named,
    stdout: record().stdout,
  };
};

describe('createPostToolUseCommand', () => {
  it.each([
    {
      condition: 'the tool names a file',
      path: 'src/ui/a.ts',
      stdin: '{"session_id":"s1","agent_id":"agent-1","tool_input":{"file_path":"src/ui/a.ts"}}',
    },
    {
      condition: 'the tool names a notebook',
      path: 'notes.ipynb',
      stdin:
        '{"session_id":"s1","agent_id":"agent-1","tool_input":{"notebook_path":"notes.ipynb"}}',
    },
  ])(
    'should record the blocks named, then remind the session of them, when $condition',
    async ({ path, stdin }) => {
      // Arrange
      const asked = {
        reminder: {
          blocks: [
            {
              files: [
                'ui.md',
              ],
              id: BlockId.create('ui'),
              musts: [],
            },
            {
              files: [
                'typescript.md',
              ],
              id: BlockId.create('typescript'),
              musts: [],
            },
          ],
          path: 'src/ui/a.ts',
        },
        stdin,
      };

      // Act
      const run = await runOf(asked);

      // Assert
      expect(run).toStrictEqual({
        asked: [
          {
            agent: AgentId.create('agent-1'),
            path,
            session: SessionId.create('s1'),
          },
        ],
        named: [
          {
            agent: AgentId.create('agent-1'),
            askedBefore: 1,
            ids: [
              BlockId.create('ui'),
              BlockId.create('typescript'),
            ],
            session: SessionId.create('s1'),
          },
        ],
        stdout:
          '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"ui governs src/ui/a.ts: read ui.md.\\ntypescript governs src/ui/a.ts: read typescript.md."}}\n',
      });
    },
  );

  it.each<{
    condition: string;
    named: Named[];
    reminder: Reminder | undefined;
  }>([
    {
      condition: 'no block is left to name',
      named: [
        {
          agent: undefined,
          askedBefore: 1,
          ids: [],
          session: SessionId.create('s1'),
        },
      ],
      reminder: {
        blocks: [],
        path: 'README.md',
      },
    },
    {
      condition: 'the session keeps no reminder',
      named: [],
      reminder: undefined,
    },
  ])('should write nothing when $condition', async ({ named, reminder }) => {
    // Arrange
    const asked = {
      reminder,
      stdin: '{"session_id":"s1","tool_input":{"file_path":"README.md"}}',
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect({
      named: run.named,
      stdout: run.stdout,
    }).toStrictEqual({
      named,
      stdout: '',
    });
  });

  it.each([
    {
      condition: 'the session id is no plain name',
      stdin: '{"session_id":"x/y","tool_input":{"file_path":"src/ui/a.ts"}}',
    },
    {
      condition: 'the agent id is no plain name',
      stdin: '{"session_id":"s1","agent_id":"../agent","tool_input":{"file_path":"src/ui/a.ts"}}',
    },
    {
      condition: 'the event names no file',
      stdin: '{"session_id":"s1","tool_input":{"file_path":""}}',
    },
  ])('should ask for no reminder, and write nothing, when $condition', async ({ stdin }) => {
    // Arrange
    const asked = {
      reminder: undefined,
      stdin,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run).toStrictEqual({
      asked: [],
      named: [],
      stdout: '',
    });
  });
});
