import { describe, expect, it } from 'bun:test';

import { onceSucceeded } from '../once-succeeded';

describe('onceSucceeded', () => {
  it('should make the value on the first call and give it on every later one', () => {
    // Arrange
    const makes: string[] = [];
    const read = onceSucceeded(() => {
      makes.push('made');

      return 'Ports';
    });
    const first = read();

    // Act
    const second = read();

    // Assert
    expect({
      first,
      makes,
      second,
    }).toStrictEqual({
      first: 'Ports',
      makes: [
        'made',
      ],
      second: 'Ports',
    });
  });

  it('should make the value again when the make before it threw', () => {
    // Arrange
    const unreadable = new Error('unreadable');
    const makes = [
      (): string => {
        throw unreadable;
      },
      (): string => 'Ports',
    ];
    const read = onceSucceeded(() => makes.shift()?.());

    // Act
    const firstRead = (): unknown => read();

    // Assert
    expect(firstRead).toThrow(unreadable);

    // Act
    const title = read();

    // Assert
    expect(title).toBe('Ports');
  });

  it('should make the promise again when the one before it rejected', async () => {
    // Arrange
    const unreachable = new Error('unreachable');
    const makes = [
      (): Promise<string> => Promise.reject(unreachable),
      (): Promise<string> => Promise.resolve('Ports'),
    ];
    const read = onceSucceeded(() => makes.shift()?.());

    // Act
    const firstRead = read();

    // Assert
    await expect(firstRead).rejects.toBe(unreachable);

    // Act
    const title = await read();

    // Assert
    expect(title).toBe('Ports');
  });

  it('should give the same promise on every call while it has not rejected', () => {
    // Arrange
    const read = onceSucceeded(() => Promise.resolve('Ports'));
    const first = read();

    // Act
    const second = read();

    // Assert
    expect(second).toBe(first);
  });
});
