import { describe, expect, it } from 'bun:test';

import { HookEventName, SessionOrigin } from '../../../domain/entities';
import { SessionId } from '../../../domain/value-objects';
import { hookEventNameOf, hookEventOf, sessionIdOf, sessionOriginOf } from '../hook-event.utils';

describe('hookEventOf', () => {
  it.each([
    {
      condition: 'it sits at the top of the event',
      expected: 'session-1',
      name: 'session_id',
      text: '{"session_id":"session-1","cwd":"/work"}',
    },
    {
      condition: 'it sits inside another field',
      expected: 'bun run check',
      name: 'command',
      text: '{"tool_name":"Bash","tool_input":{"command":"bun run check"}}',
    },
    {
      condition: 'it sits in an element of a list',
      expected: 'b.ts',
      name: 'file_path',
      text: '{"edits":[7,{"other":"a.ts"},{"file_path":"b.ts"},{"file_path":"c.ts"}]}',
    },
    {
      condition: 'an earlier field holds it deeper than a later one',
      expected: 'deep',
      name: 'file_path',
      text: '{"tool_input":{"file_path":"deep"},"file_path":"top"}',
    },
    {
      condition: 'a field of its name holds no string but one inside it does',
      expected: 'inner',
      name: 'file_path',
      text: '{"file_path":{"file_path":"inner"},"other":{"file_path":"later"}}',
    },
    {
      condition: 'a field of its name holds a number and a later one a string',
      expected: 'later',
      name: 'agent_id',
      text: '{"agent_id":7,"nested":{"agent_id":"later"}}',
    },
    {
      condition: 'it sits as deep as an event may nest',
      expected: 'deep',
      name: 'file_path',
      text: `${'['.repeat(63)}{"file_path":"deep"}${']'.repeat(63)}`,
    },
  ])('should read the first string of the name when $condition', ({ expected, name, text }) => {
    // Arrange
    const event = hookEventOf(text);

    // Act
    const field = event.field(name);

    // Assert
    expect(field).toBe(expected);
  });

  it.each([
    {
      condition: 'no field has its name',
      name: 'agent_id',
      text: '{"session_id":"session-1","list":[null,true,"agent_id"]}',
    },
    {
      condition: 'the field is an empty text',
      name: 'agent_id',
      text: '{"session_id":"session-1","agent_id":""}',
    },
    {
      condition: 'the event is a bare string',
      name: 'session_id',
      text: '"session_id"',
    },
    {
      condition: 'the event is no JSON',
      name: 'session_id',
      text: 'session_id: session-1',
    },
    {
      condition: 'the event nests deeper than an event may',
      name: 'file_path',
      text: `${'['.repeat(64)}{"file_path":"deep"}${']'.repeat(64)}`,
    },
  ])('should read the field as absent when $condition', ({ name, text }) => {
    // Arrange
    const event = hookEventOf(text);

    // Act
    const field = event.field(name);

    // Assert
    expect(field).toBeUndefined();
  });

  it.each([
    {
      condition: 'its first boolean is true',
      expected: true,
      text: '{"session_id":"s1","stop_hook_active":true}',
    },
    {
      condition: 'its first boolean is false',
      expected: false,
      text: '{"stop_hook_active":false,"nested":{"stop_hook_active":true}}',
    },
    {
      condition: 'a field of its name holds the text true and a later one the boolean',
      expected: true,
      text: '{"stop_hook_active":"true","nested":{"stop_hook_active":true}}',
    },
    {
      condition: 'it holds only the text true',
      expected: false,
      text: '{"stop_hook_active":"true"}',
    },
    {
      condition: 'no field has its name',
      expected: false,
      text: '{"session_id":"s1"}',
    },
    {
      condition: 'the event is no JSON',
      expected: false,
      text: 'stop_hook_active: true',
    },
  ])('should read the flag as set only when $condition', ({ expected, text }) => {
    // Arrange
    const event = hookEventOf(text);

    // Act
    const isActive = event.isTrue('stop_hook_active');

    // Assert
    expect(isActive).toBe(expected);
  });
});

describe('hookEventNameOf', () => {
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
    {
      expected: HookEventName.Unknown,
      text: undefined,
    },
  ])('should read $expected when Claude Code names the event $text', ({ expected, text }) => {
    // Act
    const name = hookEventNameOf(text);

    // Assert
    expect(name).toBe(expected);
  });
});

describe('sessionOriginOf', () => {
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
      text: undefined,
    },
  ])('should read $expected when Claude Code names the origin $text', ({ expected, text }) => {
    // Act
    const origin = sessionOriginOf(text);

    // Assert
    expect(origin).toBe(expected);
  });
});

describe('sessionIdOf', () => {
  it.each([
    {
      condition: 'the id is a plain name',
      expected: SessionId.create('session-1'),
      text: '{"session_id":"session-1"}',
    },
    {
      condition: 'the id is no plain name',
      expected: undefined,
      text: '{"session_id":"../session"}',
    },
    {
      condition: 'the event names no session',
      expected: undefined,
      text: '{"cwd":"/work"}',
    },
  ])('should read the session as $expected when $condition', ({ expected, text }) => {
    // Arrange
    const event = hookEventOf(text);

    // Act
    const session = sessionIdOf(event);

    // Assert
    expect(session).toBe(expected);
  });
});
