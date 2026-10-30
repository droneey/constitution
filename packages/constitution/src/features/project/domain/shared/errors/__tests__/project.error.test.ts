import { describe, expect, it } from 'bun:test';

import { isProgramError } from '#/kernel/errors';
import { AbsolutePath } from '#/kernel/value-objects';

import { isProjectError } from '../project.error';
import { ReleaseError, ReleaseFailure } from '../release.error';
import { UnreadableFileError, UnreadableFileFailure } from '../unreadable-file.error';

const cause = new Error('EACCES');
const configPath = AbsolutePath.create('/work/constitution.yaml');
const releaseFolderPath = AbsolutePath.create('/work/.droneey/constitution');

describe('isProjectError', () => {
  it.each([
    {
      error: new UnreadableFileError(
        {
          code: UnreadableFileFailure.Config,
          details: {
            path: configPath,
          },
        },
        {
          cause,
        },
      ),
      name: 'UnreadableFileError',
    },
    {
      error: new ReleaseError({
        code: ReleaseFailure.BlocksUnlisted,
        details: {
          path: releaseFolderPath,
        },
      }),
      name: 'ReleaseError',
    },
  ])('should recognise a program error named $name', ({ error, name }) => {
    // Act
    const answer = isProjectError(error);

    // Assert
    expect({
      answer,
      isProgramError: isProgramError(error),
      name: error.name,
    }).toStrictEqual({
      answer: true,
      isProgramError: true,
      name,
    });
  });

  it('should refuse another error when its message reads like a failure of a project', () => {
    // Act
    const answer = isProjectError(new Error('blocks-unlisted: {"path":"/work"}'));

    // Assert
    expect(answer).toBe(false);
  });
});
