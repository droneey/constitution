import { afterEach, describe, expect, it } from 'bun:test';

import type { ReactElement } from 'react';
import { Suspense, use } from 'react';

import { cleanup, render, screen } from '@testing-library/react';

import { trackedForUse } from '../promise.utils';

afterEach(cleanup);

function Title({ title }: { title: Promise<string> }): ReactElement {
  return <h1>{use(title)}</h1>;
}

describe('trackedForUse', () => {
  it('should let a component read a promise that has settled in the same render', async () => {
    // Arrange
    const title = trackedForUse(Promise.resolve('Ports'));

    await title;

    // Act
    render(
      <Suspense>
        <Title title={title} />
      </Suspense>,
    );

    // Assert
    expect(screen.queryByRole('heading')?.textContent).toBe('Ports');
  });

  it('should hold the reason a promise failed with where the component reads it', async () => {
    // Arrange
    const failure = new Error('unreachable');
    const title = trackedForUse(Promise.reject(failure));

    // Act
    await title.catch(() => undefined);

    // Assert
    expect({
      reason: Reflect.get(title, 'reason'),
      status: Reflect.get(title, 'status'),
    }).toStrictEqual({
      reason: failure,
      status: 'rejected',
    });
  });
});
