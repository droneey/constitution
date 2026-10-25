import { describe, expect, it } from 'bun:test';

import type { SerializedPageTree } from 'fumadocs-core/source/client';

import type { Page } from '../../../domain/entities';
import { ExportError, ExportFailure } from '../../../domain/errors';
import { createStaticExports } from '../static-exports.adapter';

const CATALOG_ADDRESS = '/v0.83.0/api/pages';

const NAVIGATION_ADDRESS = '/v0.83.0/api/navigation';

const treeFixture = (): SerializedPageTree => ({
  // biome-ignore lint/style/useNamingConvention: Fumadocs marks a serialized page tree by this key
  $fumadocs_loader: 'page-tree',
  data: {
    children: [
      {
        name: 'Overview',
        type: 'page',
        url: '/docs',
      },
    ],
    name: 'Constitution',
  },
});

const guideFixture = (): Page => ({
  collection: 'guide',
  description: 'How a project adds blocks of its own.',
  path: 'guides/write-a-pack.md',
  title: 'Write a pack',
});

const catalogFixture = (): Readonly<Record<string, Page>> => ({
  'guides/write-a-pack': guideFixture(),
});

interface Answer {
  readonly body: unknown;
  readonly status?: number;
}

/** answers each address with its body, as JSON when it is not already text, and any other with 404 */
const serving =
  (answers: Readonly<Record<string, Answer>>) =>
  (address: string): Promise<Response> => {
    const answer = answers[address];

    return Promise.resolve(
      answer === undefined
        ? new Response(undefined, {
            status: 404,
          })
        : new Response(
            typeof answer.body === 'string' ? answer.body : JSON.stringify(answer.body),
            {
              status: answer.status ?? 200,
            },
          ),
    );
  };

const exportsServing = (
  answers: Readonly<Record<string, Answer>>,
): ReturnType<typeof createStaticExports> =>
  createStaticExports({
    catalogAddress: CATALOG_ADDRESS,
    navigationAddress: NAVIGATION_ADDRESS,
    transport: serving(answers),
  });

/** the code, the details and the name of the cause a read failed with, or the error itself when it is none of the feature's */
const failureOf = (read: Promise<unknown>): Promise<unknown> =>
  read.then(
    () => undefined,
    (error: unknown) =>
      error instanceof ExportError
        ? {
            cause: error.cause instanceof Error ? error.cause.name : error.cause,
            code: error.code,
            details: error.details,
          }
        : error,
  );

const unavailableAt = (address: string, cause?: string): unknown => ({
  cause,
  code: ExportFailure.Unavailable,
  details: {
    address,
  },
});

describe('createStaticExports', () => {
  describe('readNavigation', () => {
    it('should read the tree the file holds', async () => {
      // Arrange
      const exports = exportsServing({
        [NAVIGATION_ADDRESS]: {
          body: treeFixture(),
        },
      });

      // Act
      const tree = await exports.readNavigation();

      // Assert
      expect(tree).toStrictEqual(treeFixture());
    });

    it.each([
      {
        answer: {
          body: treeFixture(),
          status: 500,
        },
        condition: 'the site answers no file',
      },
      {
        answer: {
          body: '<!doctype html>',
        },
        condition: 'the file holds no JSON',
      },
      {
        answer: {
          body: null,
        },
        condition: 'the file holds JSON with no tree',
      },
      {
        answer: {
          body: {
            ...treeFixture(),
            // biome-ignore lint/style/useNamingConvention: Fumadocs marks a serialized page tree by this key
            $fumadocs_loader: 'other',
          },
        },
        condition: 'the file holds a value of another loader',
      },
      {
        answer: {
          body: {
            // biome-ignore lint/style/useNamingConvention: Fumadocs marks a serialized page tree by this key
            $fumadocs_loader: 'page-tree',
          },
        },
        condition: 'the file holds the mark alone',
      },
      {
        answer: {
          body: {
            ...treeFixture(),
            data: null,
          },
        },
        condition: 'the tree is empty',
      },
      {
        answer: {
          body: {
            ...treeFixture(),
            data: 'Constitution',
          },
        },
        condition: 'the tree is no object',
      },
    ])('should fail as unavailable, with the address, when $condition', async ({ answer }) => {
      // Arrange
      const exports = exportsServing({
        [NAVIGATION_ADDRESS]: answer,
      });

      // Act
      const failure = await failureOf(exports.readNavigation());

      // Assert
      expect(failure).toStrictEqual(unavailableAt(NAVIGATION_ADDRESS));
    });

    it('should fail as unavailable, keeping the cause, when the network fails', async () => {
      // Arrange
      const exports = createStaticExports({
        catalogAddress: CATALOG_ADDRESS,
        navigationAddress: NAVIGATION_ADDRESS,
        transport: () => Promise.reject(new TypeError('Failed to fetch')),
      });

      // Act
      const failure = await failureOf(exports.readNavigation());

      // Assert
      expect(failure).toStrictEqual(unavailableAt(NAVIGATION_ADDRESS, 'TypeError'));
    });
  });

  describe('find', () => {
    it.each([
      {
        condition: 'the list holds the slugs',
        expected: guideFixture(),
        slugs: [
          'guides',
          'write-a-pack',
        ],
      },
      {
        condition: 'the list holds no page at the slugs',
        expected: undefined,
        slugs: [
          'guides',
          'moved',
        ],
      },
      {
        condition: 'the slugs name a key every object inherits',
        expected: undefined,
        slugs: [
          'constructor',
        ],
      },
    ])('should find the page when $condition', async ({ expected, slugs }) => {
      // Arrange
      const exports = exportsServing({
        [CATALOG_ADDRESS]: {
          body: catalogFixture(),
        },
      });

      // Act
      const page = await exports.find(slugs);

      // Assert
      expect(page).toStrictEqual(expected);
    });

    it('should read the list once however many pages are found', async () => {
      // Arrange
      const reads: string[] = [];
      const exports = createStaticExports({
        catalogAddress: CATALOG_ADDRESS,
        navigationAddress: NAVIGATION_ADDRESS,
        transport: (address) => {
          reads.push(address);

          return serving({
            [CATALOG_ADDRESS]: {
              body: catalogFixture(),
            },
          })(address);
        },
      });

      // Act
      await exports.find([
        'guides',
        'write-a-pack',
      ]);
      await exports.find([
        'guides',
        'moved',
      ]);

      // Assert
      expect(reads).toStrictEqual([
        CATALOG_ADDRESS,
      ]);
    });

    it.each([
      {
        answer: {
          body: catalogFixture(),
          status: 404,
        },
        condition: 'the site answers no file',
      },
      {
        answer: {
          body: {
            'guides/write-a-pack': {
              ...guideFixture(),
              title: 7,
            },
          },
        },
        condition: 'a page in the list lacks a title it can show',
      },
    ])('should fail as unavailable, with the address, when $condition', async ({ answer }) => {
      // Arrange
      const exports = exportsServing({
        [CATALOG_ADDRESS]: answer,
      });

      // Act
      const failure = await failureOf(exports.find([]));

      // Assert
      expect(failure).toStrictEqual(unavailableAt(CATALOG_ADDRESS));
    });

    it('should read the list again after a read that failed', async () => {
      // Arrange
      const answers: Answer[] = [
        {
          body: catalogFixture(),
          status: 503,
        },
        {
          body: catalogFixture(),
        },
      ];
      const exports = createStaticExports({
        catalogAddress: CATALOG_ADDRESS,
        navigationAddress: NAVIGATION_ADDRESS,
        transport: (address) =>
          serving({
            [CATALOG_ADDRESS]: answers.shift() ?? {
              body: {},
            },
          })(address),
      });

      await failureOf(
        exports.find([
          'guides',
          'write-a-pack',
        ]),
      );

      // Act
      const page = await exports.find([
        'guides',
        'write-a-pack',
      ]);

      // Assert
      expect(page).toStrictEqual(guideFixture());
    });
  });
});
