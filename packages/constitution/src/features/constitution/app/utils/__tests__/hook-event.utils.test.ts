import { describe, expect, it } from 'bun:test';

import { hookEventOf } from '../hook-event.utils';

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
      condition: 'no field has its name',
      expected: '',
      name: 'agent_id',
      text: '{"session_id":"session-1","list":[null,true,"agent_id"]}',
    },
    {
      condition: 'the event is a bare string',
      expected: '',
      name: 'session_id',
      text: '"session_id"',
    },
    {
      condition: 'the event is no JSON',
      expected: '',
      name: 'session_id',
      text: 'session_id: session-1',
    },
  ])('should read the first string of the name when $condition', ({ expected, name, text }) => {
    // Arrange
    const event = hookEventOf(text);

    // Act
    const field = event.field(name);

    // Assert
    expect(field).toBe(expected);
  });
});
