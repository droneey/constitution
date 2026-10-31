import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { AbsolutePath } from '#/kernel/value-objects';

import type { GateTarget, GateVerdict, SessionAgent } from '../../../../../domain/entities';
import { GateVerdictKind, TargetKind } from '../../../../../domain/entities';
import { AgentId, SessionId, ToolUseId } from '../../../../../domain/value-objects';
import { actionAnswerOf, hookOutputOf } from '../../../../utils';
import { createPreToolUseCommand } from '../pre-tool-use.cli';

interface Gated {
  agent: SessionAgent;
  session: SessionId;
  targets: readonly GateTarget[];
}

interface Marked {
  call: ToolUseId;
  folderRunIn: AbsolutePath;
  session: SessionId;
}

const refused: GateVerdict = {
  shouldIgnoreParts: false,
  changedByCommands: [],
  kind: GateVerdictKind.Refused,
  parts: [
    AbsolutePath.create('/state/parts/abc.1.md'),
  ],
  unreadCount: 2,
};

const passed: GateVerdict = {
  kind: GateVerdictKind.PassedUnread,
  unreadCount: 2,
};

const SHELL_CALL =
  '{"hook_event_name":"PreToolUse","session_id":"s1","cwd":"/work/project","tool_name":"Bash","tool_use_id":"toolu_1","tool_input":{}}';
const MCP_CALL =
  '{"hook_event_name":"PreToolUse","session_id":"s1","cwd":"/work/project","tool_name":"mcp__docs__list_pages","tool_use_id":"toolu_1","tool_input":{}}';

const runOf = async (input: {
  stdin: string;
  verdict?: GateVerdict;
}): Promise<{
  gated: Gated[];
  marked: Marked[];
  stdout: string;
}> => {
  const gated: Gated[] = [];
  const marked: Marked[] = [];
  const { context, record } = createFakeContext({
    places: {
      cwd: '/work/project',
    },
    stdin: input.stdin,
  });

  await runCommand({
    args: [],
    command: createPreToolUseCommand({
      ...context,
      gateAction: (asked: Gated): GateVerdict => {
        gated.push(asked);

        return (
          input.verdict ?? {
            kind: GateVerdictKind.Allowed,
          }
        );
      },
      markShell: (asked: Marked): void => {
        marked.push(asked);
      },
    }),
    group: 'hook',
  });

  return {
    gated,
    marked,
    stdout: record().stdout,
  };
};

describe('createPreToolUseCommand', () => {
  it.each([
    {
      condition: 'an edit names its file from the folder of the event',
      stdin:
        '{"hook_event_name":"PreToolUse","session_id":"s1","agent_id":"agent-1","cwd":"/work/project/src","tool_name":"Edit","tool_input":{"file_path":"a.ts"}}',
      target: {
        kind: TargetKind.File,
        path: AbsolutePath.create('/work/project/src/a.ts'),
      },
    },
    {
      condition: 'a subagent starts in the folder the run starts in',
      stdin:
        '{"hook_event_name":"PreToolUse","session_id":"s1","agent_id":"agent-1","tool_name":"Agent","tool_input":{}}',
      target: {
        kind: TargetKind.Folder,
        path: AbsolutePath.create('/work/project'),
      },
    },
    {
      condition: 'an edit names no file',
      stdin:
        '{"hook_event_name":"PreToolUse","session_id":"s1","agent_id":"agent-1","tool_name":"Edit","tool_input":{}}',
      target: {
        kind: TargetKind.Folder,
        path: AbsolutePath.create('/work/project'),
      },
    },
    {
      condition: 'an MCP tool names a file, which it does not edit',
      stdin:
        '{"hook_event_name":"PreToolUse","session_id":"s1","agent_id":"agent-1","tool_name":"mcp__docs__create_page","tool_input":{"file_path":"a.ts"}}',
      target: {
        kind: TargetKind.Folder,
        path: AbsolutePath.create('/work/project'),
      },
    },
    {
      condition: 'an MCP tool writes',
      stdin:
        '{"hook_event_name":"PreToolUse","session_id":"s1","agent_id":"agent-1","cwd":"/work/project","tool_name":"mcp__docs__create_page","tool_input":{}}',
      target: {
        kind: TargetKind.Folder,
        path: AbsolutePath.create('/work/project'),
      },
    },
  ])(
    'should ask the gate for what the action touches when $condition, and refuse it as told',
    async ({ stdin, target }) => {
      // Act
      const run = await runOf({
        stdin,
        verdict: refused,
      });

      // Assert
      expect({
        gated: run.gated,
        stdout: run.stdout,
      }).toStrictEqual({
        gated: [
          {
            agent: AgentId.create('agent-1'),
            session: SessionId.create('s1'),
            targets: [
              target,
            ],
          },
        ],
        stdout: hookOutputOf(
          actionAnswerOf(refused) ?? {
            systemMessage: '',
          },
        ),
      });
    },
  );

  it.each<{
    condition: string;
    marked: Marked[];
    stdin: string;
    verdict: GateVerdict;
  }>([
    {
      condition: 'the gate allows a shell command',
      marked: [
        {
          call: ToolUseId.create('toolu_1'),
          folderRunIn: AbsolutePath.create('/work/project'),
          session: SessionId.create('s1'),
        },
      ],
      stdin: SHELL_CALL,
      verdict: {
        kind: GateVerdictKind.Allowed,
      },
    },
    {
      condition: 'the gate lets a shell command through after three refusals',
      marked: [
        {
          call: ToolUseId.create('toolu_1'),
          folderRunIn: AbsolutePath.create('/work/project'),
          session: SessionId.create('s1'),
        },
      ],
      stdin: SHELL_CALL,
      verdict: {
        kind: GateVerdictKind.PassedUnread,
        unreadCount: 2,
      },
    },
    {
      condition: 'the gate refuses a shell command',
      marked: [],
      stdin: SHELL_CALL,
      verdict: refused,
    },
    {
      condition: 'a shell command names no call',
      marked: [],
      stdin:
        '{"hook_event_name":"PreToolUse","session_id":"s1","cwd":"/work/project","tool_name":"Bash","tool_input":{}}',
      verdict: {
        kind: GateVerdictKind.Allowed,
      },
    },
    {
      condition: 'the gate closes on an MCP call',
      marked: [],
      stdin: MCP_CALL,
      verdict: {
        causes: [],
        kind: GateVerdictKind.Closed,
      },
    },
    {
      condition: 'the gate lets an MCP call through',
      marked: [
        {
          call: ToolUseId.create('toolu_1'),
          folderRunIn: AbsolutePath.create('/work/project'),
          session: SessionId.create('s1'),
        },
      ],
      stdin: MCP_CALL,
      verdict: {
        kind: GateVerdictKind.Allowed,
      },
    },
    {
      condition: 'the gate allows an edit',
      marked: [],
      stdin:
        '{"hook_event_name":"PreToolUse","session_id":"s1","cwd":"/work/project","tool_name":"Edit","tool_use_id":"toolu_1","tool_input":{"file_path":"a.ts"}}',
      verdict: {
        kind: GateVerdictKind.Allowed,
      },
    },
  ])(
    'should keep the tree of a shell command or an MCP call by its call when $condition',
    async ({ marked, stdin, verdict }) => {
      // Act
      const run = await runOf({
        stdin,
        verdict,
      });

      // Assert
      expect(run.marked).toStrictEqual(marked);
    },
  );

  it.each<{
    condition: string;
    stdout: string;
    verdict: GateVerdict;
  }>([
    {
      condition: 'the gate allows it',
      stdout: '',
      verdict: {
        kind: GateVerdictKind.Allowed,
      },
    },
    {
      condition: 'the gate lets it through after three refusals',
      stdout: hookOutputOf(
        actionAnswerOf(passed) ?? {
          systemMessage: '',
        },
      ),
      verdict: passed,
    },
  ])('should answer the action as the gate tells when $condition', async ({ stdout, verdict }) => {
    // Act
    const run = await runOf({
      stdin: SHELL_CALL,
      verdict,
    });

    // Assert
    expect(run.stdout).toStrictEqual(stdout);
  });

  it.each([
    {
      condition: 'the tool only reads',
      stdin:
        '{"hook_event_name":"PreToolUse","session_id":"s1","tool_name":"Read","tool_input":{"file_path":"/work/a.ts"}}',
    },
    {
      condition: 'the event names no session',
      stdin:
        '{"hook_event_name":"PreToolUse","tool_name":"Edit","tool_input":{"file_path":"/work/a.ts"}}',
    },
    {
      condition: 'the event is no tool call to come',
      stdin:
        '{"hook_event_name":"PostToolUse","session_id":"s1","tool_name":"Edit","tool_input":{"file_path":"/work/a.ts"}}',
    },
    {
      condition: 'the event names no event',
      stdin: '{"session_id":"s1","tool_name":"Edit","tool_input":{"file_path":"/work/a.ts"}}',
    },
    {
      condition: 'the agent id is no plain name',
      stdin:
        '{"hook_event_name":"PreToolUse","session_id":"s1","agent_id":"../x","tool_name":"Edit","tool_input":{"file_path":"/work/a.ts"}}',
    },
  ])('should ask the gate nothing when $condition', async ({ stdin }) => {
    // Act
    const run = await runOf({
      stdin,
    });

    // Assert
    expect(run).toStrictEqual({
      gated: [],
      marked: [],
      stdout: '',
    });
  });
});
