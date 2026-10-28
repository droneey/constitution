import { describe, expect, it } from 'bun:test';

import fc from 'fast-check';

import type { SettingKey } from '../setting-key.value-object';
import { SettingKey as Key, KeyKind } from '../setting-key.value-object';

// Texts of the pieces a key is made of, its addresses and slots among them, and texts of any
// characters.
const keyTexts = fc.oneof(
  fc
    .array(fc.constantFrom('rules', 'name', 'lint', '[', ']', '=', '@', 'checks', '.'), {
      maxLength: 8,
    })
    .map((pieces) => pieces.join('')),
  fc.string(),
);

// The invariant: every text reads as a key whose parts spell the text again.
const isSpelledBack = (text: string): boolean => {
  const key = Key.of(text);

  switch (key.kind) {
    case KeyKind.Address:
      return Key.addressText(key) === text;
    case KeyKind.Insert:
      return `${key.list}@${key.slot}` === text;
    case KeyKind.Plain:
      return key.text === text;
    default:
      return key satisfies never;
  }
};

describe('SettingKey', () => {
  it.each<{
    condition: string;
    key: SettingKey;
    text: string;
  }>([
    {
      condition: 'it is a plain key',
      key: {
        kind: KeyKind.Plain,
        text: 'rules',
      },
      text: 'rules',
    },
    {
      condition: 'it addresses an element whose value holds "="',
      key: {
        field: 'name',
        kind: KeyKind.Address,
        list: 'forbidden',
        value: 'no=cycles',
      },
      text: 'forbidden[name=no=cycles]',
    },
    {
      condition: 'it inserts into a slot',
      key: {
        kind: KeyKind.Insert,
        list: 'jobs',
        slot: 'lint',
      },
      text: 'jobs@lint',
    },
    {
      condition: 'it names a slot twice',
      key: {
        kind: KeyKind.Plain,
        text: 'jobs@lint@fix',
      },
      text: 'jobs@lint@fix',
    },
    {
      condition: 'its brackets close before its end',
      key: {
        kind: KeyKind.Plain,
        text: 'list[name=x].tail',
      },
      text: 'list[name=x].tail',
    },
    {
      condition: 'its brackets name no field',
      key: {
        kind: KeyKind.Plain,
        text: 'list[0]',
      },
      text: 'list[0]',
    },
  ])('should read the key when $condition', ({ key, text }) => {
    // Act
    const read = Key.of(text);

    // Assert
    expect(read).toStrictEqual(key);
  });

  it('should give the address of an addressed key and none of a plain one', () => {
    // Act
    const addresses = [
      Key.addressOf('forbidden[name=no-cycles]'),
      Key.addressOf('forbidden'),
    ];

    // Assert
    expect(addresses).toStrictEqual([
      {
        field: 'name',
        kind: KeyKind.Address,
        list: 'forbidden',
        value: 'no-cycles',
      },
      undefined,
    ]);
  });

  it('should write the key that addresses an element', () => {
    // Act
    const text = Key.addressText({
      field: 'name',
      list: 'forbidden',
      value: 'no-cycles',
    });

    // Assert
    expect(text).toBe('forbidden[name=no-cycles]');
  });

  it('should read any text as a key whose parts spell it again', () => {
    // Act
    const run = fc.check(fc.property(keyTexts, isSpelledBack));

    // Assert
    expect(run.counterexample).toBeNull();
  });
});
