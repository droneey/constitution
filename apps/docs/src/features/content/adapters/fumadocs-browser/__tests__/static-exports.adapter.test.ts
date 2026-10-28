import { describe, expect, it } from 'bun:test';

import type { SerializedPageTree } from 'fumadocs-core/source/client';

import { ProgramError } from '#/kernel/errors';

import type { Page } from '../../../domain/entities';
import { ExportFailure } from '../../../domain/errors';
import { PageSlugs } from '../../../domain/value-objects';
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

/** the code, the details and the name of the cause a read failed with, or the error itself when it is none of the program's */
const failureOf = (read: Promise<unknown>): Promise<unknown> =>
  read.then(
    () => undefined,
    (error: unknown) =>
      error instanceof ProgramError
        ? {
            cause: error.cause instanceof Error ? error.cause.name : error.cause,
            code: error.code,
            details: error.details,
          }
        : error,
  );

const unreachableAt = (address: string, cause: string): unknown => ({
  cause,
  code: ExportFailure.Unreachable,
  details: {
    address,
  },
});

const malformedAt = (address: string, cause: string, problems: readonly string[]): unknown => ({
  cause,
  code: ExportFailure.Malformed,
  details: {
    address,
    problems,
  },
});

const noFileAt = (address: string, status: number): unknown => ({
  cause: undefined,
  code: ExportFailure.NoFile,
  details: {
    address,
    status,
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
        failure: noFileAt(NAVIGATION_ADDRESS, 500),
      },
      {
        answer: {
          body: '<!doctype html>',
        },
        condition: 'the file holds no JSON',
        failure: malformedAt(NAVIGATION_ADDRESS, 'SyntaxError', [
          '',
        ]),
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
        failure: malformedAt(NAVIGATION_ADDRESS, 'ZodError', [
          '$fumadocs_loader',
        ]),
      },
      {
        answer: {
          body: {
            ...treeFixture(),
            data: 'Constitution',
          },
        },
        condition: 'the tree is no object',
        failure: malformedAt(NAVIGATION_ADDRESS, 'ZodError', [
          'data',
        ]),
      },
    ])('should fail, naming the address, when $condition', async ({ answer, failure }) => {
      // Arrange
      const exports = exportsServing({
        [NAVIGATION_ADDRESS]: answer,
      });

      // Act
      const read = await failureOf(exports.readNavigation());

      // Assert
      expect(read).toStrictEqual(failure);
    });

    it.each([
      {
        condition: 'the network fails',
        failure: new TypeError('Failed to fetch'),
      },
      {
        condition: 'the site answers too slowly',
        failure: new DOMException('The operation timed out.', 'TimeoutError'),
      },
    ])('should fail as unreachable, keeping the cause, when $condition', async ({ failure }) => {
      // Arrange
      const exports = createStaticExports({
        catalogAddress: CATALOG_ADDRESS,
        navigationAddress: NAVIGATION_ADDRESS,
        transport: () => Promise.reject(failure),
      });

      // Act
      const read = await failureOf(exports.readNavigation());

      // Assert
      expect(read).toStrictEqual(unreachableAt(NAVIGATION_ADDRESS, failure.name));
    });

    it.each([
      {
        condition: 'it is of another class',
        refusal: new RangeError('no such address'),
      },
      {
        condition: 'the reader stopped it',
        refusal: new DOMException('The operation was aborted.', 'AbortError'),
      },
    ])(
      'should let a failure of the transport it does not know through as it is when $condition',
      async ({ refusal }) => {
        // Arrange
        const exports = createStaticExports({
          catalogAddress: CATALOG_ADDRESS,
          navigationAddress: NAVIGATION_ADDRESS,
          transport: () => Promise.reject(refusal),
        });

        // Act
        const failure = await failureOf(exports.readNavigation());

        // Assert
        expect(failure).toBe(refusal);
      },
    );

    it('should let a failure of the body it does not know through as it is', async () => {
      // Arrange
      const unreadable = new RangeError('unreadable');
      const exports = createStaticExports({
        catalogAddress: CATALOG_ADDRESS,
        navigationAddress: NAVIGATION_ADDRESS,
        transport: () =>
          Promise.resolve(
            Object.assign(new Response('{}'), {
              json: () => Promise.reject(unreadable),
            }),
          ),
      });

      // Act
      const failure = await failureOf(exports.readNavigation());

      // Assert
      expect(failure).toBe(unreadable);
    });

    it('should hand the transport a signal that bounds the read', async () => {
      // Arrange
      const signals: AbortSignal[] = [];
      const exports = createStaticExports({
        catalogAddress: CATALOG_ADDRESS,
        navigationAddress: NAVIGATION_ADDRESS,
        transport: (address, { signal }) => {
          signals.push(signal);

          return serving({
            [NAVIGATION_ADDRESS]: {
              body: treeFixture(),
            },
          })(address);
        },
      });

      // Act
      await exports.readNavigation();

      // Assert
      expect(signals.map((signal) => signal.aborted)).toStrictEqual([
        false,
      ]);
    });
  });

  describe('find', () => {
    it.each([
      {
        condition: 'the list holds the slugs',
        expected: guideFixture(),
        slugs: PageSlugs.create([
          'guides',
          'write-a-pack',
        ]),
      },
      {
        condition: 'the list holds no page at the slugs',
        expected: undefined,
        slugs: PageSlugs.create([
          'guides',
          'moved',
        ]),
      },
      {
        condition: 'the slugs name a key every object inherits',
        expected: undefined,
        slugs: PageSlugs.create([
          'constructor',
        ]),
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

      await exports.find(
        PageSlugs.create([
          'guides',
          'write-a-pack',
        ]),
      );

      // Act
      await exports.find(
        PageSlugs.create([
          'guides',
          'moved',
        ]),
      );

      // Assert
      expect(reads).toStrictEqual([
        CATALOG_ADDRESS,
      ]);
    });

    it('should fail, naming the address, when a page in the list lacks a title it can show', async () => {
      // Arrange
      const exports = exportsServing({
        [CATALOG_ADDRESS]: {
          body: {
            'guides/write-a-pack': {
              ...guideFixture(),
              title: 7,
            },
          },
        },
      });

      // Act
      const read = await failureOf(exports.find(PageSlugs.create([])));

      // Assert
      expect(read).toStrictEqual(
        malformedAt(CATALOG_ADDRESS, 'ZodError', [
          'guides/write-a-pack.title',
        ]),
      );
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
        exports.find(
          PageSlugs.create([
            'guides',
            'write-a-pack',
          ]),
        ),
      );

      // Act
      const page = await exports.find(
        PageSlugs.create([
          'guides',
          'write-a-pack',
        ]),
      );

      // Assert
      expect(page).toStrictEqual(guideFixture());
    });
  });
});
