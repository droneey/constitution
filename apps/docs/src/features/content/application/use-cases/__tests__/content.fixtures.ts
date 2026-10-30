import type { Page } from '../../../domain/page/entities';

export const pageFixture = (overrides: Partial<Page> = {}): Page => ({
  collection: 'guide',
  description: 'How a project adds blocks of its own.',
  path: 'guides/write-a-pack.md',
  title: 'Write a pack',
  ...overrides,
});

export const pagesFixture = (): ReadonlyMap<string, Page> =>
  new Map([
    [
      'guides/write-a-pack',
      pageFixture(),
    ],
    [
      '',
      pageFixture({
        collection: 'overview',
        description: 'The rules a repository is built by.',
        path: 'README.md',
        title: 'Overview',
      }),
    ],
  ]);
