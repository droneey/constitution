import { describe, expect, it } from 'bun:test';

import { z } from 'zod';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { AbsolutePath, BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import type { Reminder } from '../../../../../domain/entities';
import { SessionAgent } from '../../../../../domain/entities';
import type { ReadRange } from '../../../../../domain/use-cases/commands/record-read';
import { AgentId, SessionId, ToolUseId } from '../../../../../domain/value-objects';
import { reminderNotesOf } from '../../../../utils';
import { createPostToolUseCommand } from '../post-tool-use.cli';

const CLAUDE_CODE_TEXT_CAP = 10_000;

interface Asked {
  agent: SessionAgent;
  path: string;
  session: SessionId;
}

interface Recorded {
  agent: SessionAgent;
  ids: readonly BlockId[];
  session: SessionId;
}

interface Named extends Recorded {
  askedBefore: number;
}

const contextOf = (
  stdout: string,
): {
  readonly event: unknown;
  readonly notes: readonly string[];
} => {
  const output = z
    .strictObject({
      hookSpecificOutput: z.strictObject({
        additionalContext: z.string(),
        hookEventName: z.string(),
      }),
    })
    .parse(JSON.parse(stdout)).hookSpecificOutput;

  return {
    event: output.hookEventName,
    notes: output.additionalContext.split('\n'),
  };
};

interface Gated {
  agent: SessionAgent;
  session: SessionId;
}

interface RuleReadAsked extends Gated {
  path: AbsolutePath;
  range: ReadRange;
}

interface OwnChanged extends Gated {
  paths: readonly AbsolutePath[];
}

interface ShellSettled extends Gated {
  call: ToolUseId;
}

const runOf = async (input: {
  changed?: readonly AbsolutePath[];
  reminder: Reminder | undefined;
  stdin: string;
}): Promise<{
  asked: Asked[];
  named: Named[];
  own: OwnChanged[];
  read: RuleReadAsked[];
  settled: ShellSettled[];
  stdout: string;
}> => {
  const asked: Asked[] = [];
  const own: OwnChanged[] = [];
  const named: Named[] = [];
  const read: RuleReadAsked[] = [];
  const settled: ShellSettled[] = [];
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
      recordOwnChanges: (changed: OwnChanged): void => {
        own.push(changed);
      },
      recordRead: (ruleRead: RuleReadAsked): void => {
        read.push(ruleRead);
      },
      settleShell: (call: ShellSettled): readonly AbsolutePath[] => {
        settled.push(call);

        return input.changed ?? [];
      },
    }),
    group: 'hook',
  });

  return {
    asked,
    named,
    own,
    read,
    settled,
    stdout: record().stdout,
  };
};

const manyBlocks: Reminder = {
  blocks: Array.from(
    {
      length: 40,
    },
    (_, index) => ({
      files: [
        `blocks/implementations/tool-${index}/foundation/a-chapter-of-some-length.md`,
        `blocks/implementations/tool-${index}/tool-${index}.md`,
        `blocks/implementations/tool-${index}/architecture/another-chapter.md`,
      ],
      id: BlockId.create(`tool-${index}`),
      musts: [],
    }),
  ),
  path: RepositoryRelativePath.create('src/a.ts'),
};

describe('createPostToolUseCommand', () => {
  it.each([
    {
      condition: 'the tool reads a file',
      path: 'src/ui/a.ts',
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","agent_id":"agent-1","tool_name":"Read","tool_input":{"file_path":"src/ui/a.ts"}}',
    },
    {
      condition: 'the tool names a file',
      path: 'src/ui/a.ts',
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","agent_id":"agent-1","tool_name":"Edit","tool_input":{"file_path":"src/ui/a.ts"}}',
    },
    {
      condition: 'the tool names a notebook',
      path: 'notes.ipynb',
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","agent_id":"agent-1","tool_name":"Edit","tool_input":{"notebook_path":"notes.ipynb"}}',
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
          path: RepositoryRelativePath.create('src/ui/a.ts'),
        },
        stdin,
      };

      // Act
      const run = await runOf(asked);

      // Assert
      expect({
        asked: run.asked,
        context: contextOf(run.stdout),
        named: run.named,
      }).toStrictEqual({
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
        context: {
          event: 'PostToolUse',
          notes: reminderNotesOf(asked.reminder).lines,
        },
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
          agent: SessionAgent.main,
          askedBefore: 1,
          ids: [],
          session: SessionId.create('s1'),
        },
      ],
      reminder: {
        blocks: [],
        path: RepositoryRelativePath.create('README.md'),
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
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","tool_name":"Edit","tool_input":{"file_path":"README.md"}}',
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
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"x/y","tool_name":"Edit","tool_input":{"file_path":"src/ui/a.ts"}}',
    },
    {
      condition: 'the agent id is no plain name',
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","agent_id":"../agent","tool_name":"Edit","tool_input":{"file_path":"src/ui/a.ts"}}',
    },
    {
      condition: 'the event names no file',
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","tool_name":"Read","tool_input":{"file_path":""}}',
    },
    {
      condition: 'an edit names no file',
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","tool_name":"Edit","tool_input":{}}',
    },
    {
      condition: 'the event names no tool',
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","tool_input":{"file_path":"src/ui/a.ts"}}',
    },
    {
      condition: 'a tool that neither reads nor edits names a file',
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","tool_name":"Grep","tool_input":{"file_path":"src/ui/a.ts"}}',
    },
    {
      condition: 'a shell command names no call',
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","tool_name":"Bash","tool_input":{}}',
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
      own: [],
      read: [],
      settled: [],
      stdout: '',
    });
  });
  it.each<{
    condition: string;
    input: string;
    range: ReadRange;
  }>([
    {
      condition: 'with the lines it asked for',
      input: '{"file_path":"src/a.ts","offset":5,"limit":10}',
      range: {
        limit: 10,
        offset: 5,
      },
    },
    {
      condition: 'with no range when it asked for no lines',
      input: '{"file_path":"src/a.ts"}',
      range: {},
    },
  ])(
    'should record a Read of a file by its path from the folder the event names, $condition',
    async ({ input, range }) => {
      // Arrange
      const asked = {
        reminder: undefined,
        stdin: `{"hook_event_name":"PostToolUse","session_id":"s1","cwd":"/work","tool_name":"Read","tool_input":${input}}`,
      };

      // Act
      const run = await runOf(asked);

      // Assert
      expect(run.read).toStrictEqual([
        {
          agent: SessionAgent.main,
          path: AbsolutePath.create('/work/src/a.ts'),
          range,
          session: SessionId.create('s1'),
        },
      ]);
    },
  );

  it("should record the file an edit changes as the agent's own, settling no call", async () => {
    // Arrange
    const asked = {
      reminder: undefined,
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","cwd":"/work","tool_name":"Edit","tool_use_id":"toolu_3","tool_input":{"file_path":"src/a.ts"}}',
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect({
      own: run.own.map((changed) => changed.paths),
      read: run.read,
      settled: run.settled,
    }).toStrictEqual({
      own: [
        [
          AbsolutePath.create('/work/src/a.ts'),
        ],
      ],
      read: [],
      settled: [],
    });
  });

  it.each([
    {
      tool: 'Bash',
    },
    {
      tool: 'mcp__docs__create_page',
    },
  ])(
    "should settle a $tool call by its call and record the files it changed as the agent's own",
    async ({ tool }) => {
      // Arrange
      const changed = [
        AbsolutePath.create('/work/notes.md'),
      ];
      const asked = {
        changed,
        reminder: undefined,
        stdin: `{"session_id":"s1","hook_event_name":"PostToolUse","tool_name":"${tool}","tool_use_id":"toolu_1","tool_input":{}}`,
      };

      // Act
      const run = await runOf(asked);

      // Assert
      expect({
        own: run.own.map((ownChanged) => ownChanged.paths),
        settled: run.settled,
      }).toStrictEqual({
        own: [
          changed,
        ],
        settled: [
          {
            agent: SessionAgent.main,
            call: ToolUseId.create('toolu_1'),
            session: SessionId.create('s1'),
          },
        ],
      });
    },
  );

  it("should settle a shell command that failed and record what it changed as the agent's own", async () => {
    // Arrange
    const asked = {
      changed: [
        AbsolutePath.create('/work/notes.md'),
      ],
      reminder: undefined,
      stdin:
        '{"hook_event_name":"PostToolUseFailure","session_id":"s1","tool_name":"Bash","tool_use_id":"toolu_2","tool_input":{}}',
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect({
      own: run.own.map((changed) => changed.paths),
      settled: run.settled.length,
    }).toStrictEqual({
      own: [
        asked.changed,
      ],
      settled: 1,
    });
  });

  it.each([
    {
      condition: 'names no event',
      stdin: '{"session_id":"s1","tool_name":"Bash","tool_use_id":"toolu_2","tool_input":{}}',
    },
    {
      condition: 'is no tool call that ended',
      stdin:
        '{"hook_event_name":"PreToolUse","session_id":"s1","tool_name":"Bash","tool_use_id":"toolu_2","tool_input":{}}',
    },
  ])(
    'should record the changes of a call, yet ask for no reminder and write nothing, when the event $condition',
    async ({ stdin }) => {
      // Arrange
      const asked = {
        changed: [
          AbsolutePath.create('/work/notes.md'),
        ],
        reminder: undefined,
        stdin,
      };

      // Act
      const run = await runOf(asked);

      // Assert
      expect({
        own: run.own.map((changed) => changed.paths),
        stdout: run.stdout,
      }).toStrictEqual({
        own: [
          asked.changed,
        ],
        stdout: '',
      });
    },
  );

  it('should keep its answer within what Claude Code shows of a hook when a file falls under many blocks', async () => {
    // Arrange
    const asked = {
      reminder: manyBlocks,
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","cwd":"/work","tool_name":"Edit","tool_input":{"file_path":"src/a.ts"}}',
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run.stdout.length < CLAUDE_CODE_TEXT_CAP).toBe(true);
  });

  it.each([
    {
      condition: 'a subagent starts',
      tool: 'Agent',
    },
    {
      condition: 'the agent searches',
      tool: 'Grep',
    },
    {
      condition: 'a shell command changed nothing',
      tool: 'Bash',
    },
  ])('should say nothing when $condition', async ({ tool }) => {
    // Arrange
    const asked = {
      reminder: undefined,
      stdin: `{"hook_event_name":"PostToolUse","session_id":"s1","tool_name":"${tool}","tool_use_id":"toolu_4","tool_input":{}}`,
    };

    // Act
    const run = await runOf(asked);

    // Assert
    expect(run.stdout).toBe('');
  });
});
