import { describe, expect, it } from 'bun:test';

import type { SettingKey } from '../setting-key.value-object';
import { SettingKey as Key, KeyKind } from '../setting-key.value-object';

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
        name: 'rules',
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
        name: 'jobs@lint@fix',
      },
      text: 'jobs@lint@fix',
    },
    {
      condition: 'its brackets close before its end',
      key: {
        kind: KeyKind.Plain,
        name: 'list[name=x].tail',
      },
      text: 'list[name=x].tail',
    },
    {
      condition: 'its brackets name no field',
      key: {
        kind: KeyKind.Plain,
        name: 'list[0]',
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
});
