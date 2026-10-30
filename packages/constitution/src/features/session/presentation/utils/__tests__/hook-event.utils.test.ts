import { describe, expect, it } from 'bun:test';

import { SessionId } from '../../../domain/session/value-objects';
import { SessionOrigin } from '../../../domain/session-start/entities';
import { HookEventName } from '../../../domain/shared/entities';
import {
  HookField,
  recordCheckEventSchema,
  sessionStartEventSchema,
  stopEventSchema,
} from '../../constants';
import { hookEventOf } from '../hook-event.utils';

describe('hookEventOf', () => {
  it.each([
    {
      condition: 'it names every field the hook reads',
      expected: {
        [HookField.AgentName]: 'helper',
        [HookField.AgentType]: 'Explore',
        [HookField.HookEventName]: HookEventName.SubagentStop,
        [HookField.SessionId]: SessionId.create('s1'),
        [HookField.StopHookActive]: true,
      },
      text: '{"session_id":"s1","hook_event_name":"SubagentStop","agent_name":"helper","agent_type":"Explore","stop_hook_active":true}',
    },
    {
      condition: 'its fields are empty or of another kind',
      expected: {
        [HookField.AgentName]: undefined,
        [HookField.AgentType]: undefined,
        [HookField.HookEventName]: HookEventName.Unknown,
        [HookField.SessionId]: undefined,
        [HookField.StopHookActive]: false,
      },
      text: '{"session_id":"","hook_event_name":7,"agent_name":null,"agent_type":["Explore"],"stop_hook_active":"true"}',
    },
  ])('should read the fields the hook reads when $condition', ({ expected, text }) => {
    // Act
    const event = hookEventOf({
      schema: stopEventSchema,
      text,
    });

    // Assert
    expect<object>(event).toStrictEqual(expected);
  });

  it.each([
    {
      condition: 'it is no JSON',
      text: 'session_id: s1',
    },
    {
      condition: 'it is a bare string',
      text: '"session_id"',
    },
    {
      condition: 'it is a list',
      text: '[{"session_id":"s1"}]',
    },
  ])('should read an event that names nothing when $condition', ({ text }) => {
    // Act
    const event = hookEventOf({
      schema: stopEventSchema,
      text,
    });

    // Assert
    expect<object>(event).toStrictEqual({
      [HookField.HookEventName]: HookEventName.Unknown,
      [HookField.StopHookActive]: false,
    });
  });

  it.each([
    {
      condition: 'it nests as deep as an event may',
      depth: 63,
      expected: SessionId.create('s1'),
    },
    {
      condition: 'it nests deeper than an event may',
      depth: 64,
      expected: undefined,
    },
  ])('should read the session as $expected when $condition', ({ depth, expected }) => {
    // Arrange
    const text = `{"session_id":"s1","deep":${'['.repeat(depth)}${']'.repeat(depth)}}`;

    // Act
    const event = hookEventOf({
      schema: stopEventSchema,
      text,
    });

    // Assert
    expect(event[HookField.SessionId]).toBe(expected);
  });

  it.each([
    {
      condition: 'the tool names its input',
      expected: 'constitution run check',
      text: '{"tool_input":{"command":"constitution run check"}}',
    },
    {
      condition: 'the tool gives an input of another kind',
      expected: undefined,
      text: '{"tool_input":"constitution run check"}',
    },
  ])('should read a field of the tool input as $expected when $condition', ({ expected, text }) => {
    // Act
    const event = hookEventOf({
      schema: recordCheckEventSchema,
      text,
    });

    // Assert
    expect(event[HookField.ToolInput][HookField.Command]).toBe(expected);
  });

  it.each([
    {
      expected: HookEventName.SessionStart,
      text: 'SessionStart',
    },
    {
      expected: HookEventName.SubagentStart,
      text: 'SubagentStart',
    },
    {
      expected: HookEventName.Stop,
      text: 'Stop',
    },
    {
      expected: HookEventName.SubagentStop,
      text: 'SubagentStop',
    },
    {
      expected: HookEventName.Unknown,
      text: 'Notification',
    },
  ])('should read $expected when Claude Code names the event $text', ({ expected, text }) => {
    // Act
    const event = hookEventOf({
      schema: stopEventSchema,
      text: JSON.stringify({
        [HookField.HookEventName]: text,
      }),
    });

    // Assert
    expect(event[HookField.HookEventName]).toBe(expected);
  });

  it.each([
    {
      expected: SessionOrigin.Startup,
      text: 'startup',
    },
    {
      expected: SessionOrigin.Resume,
      text: 'resume',
    },
    {
      expected: SessionOrigin.Clear,
      text: 'clear',
    },
    {
      expected: SessionOrigin.Compact,
      text: 'compact',
    },
    {
      expected: SessionOrigin.Unknown,
      text: 'restart',
    },
    {
      expected: SessionOrigin.Unknown,
      text: 7,
    },
  ])('should read $expected when Claude Code names the origin $text', ({ expected, text }) => {
    // Act
    const event = hookEventOf({
      schema: sessionStartEventSchema,
      text: JSON.stringify({
        [HookField.Source]: text,
      }),
    });

    // Assert
    expect(event[HookField.Source]).toBe(expected);
  });

  it.each([
    {
      condition: 'the id is a plain name',
      expected: SessionId.create('session-1'),
      text: 'session-1',
    },
    {
      condition: 'the id is no plain name',
      expected: undefined,
      text: '../session',
    },
  ])('should read the session as $expected when $condition', ({ expected, text }) => {
    // Act
    const event = hookEventOf({
      schema: stopEventSchema,
      text: JSON.stringify({
        [HookField.SessionId]: text,
      }),
    });

    // Assert
    expect(event[HookField.SessionId]).toBe(expected);
  });
});
