import type { Page } from '../../../domain/page/entities';
import type { PageSlugs } from '../../../domain/page/value-objects';
import type { PagesQueryRepository } from '../../contracts';

interface FakePagesInput {
  readonly pages: ReadonlyMap<string, Page>;
}

export const createFakePagesRepository = ({
  pages,
}: FakePagesInput): PagesQueryRepository<readonly string[]> => {
  const pageAt = (slugs: PageSlugs): Page | undefined => pages.get(slugs.join('/'));

  const textOf = (page: Page): string => `${page.collection}:${page.path}`;

  const texts = (): readonly string[] =>
    [
      ...pages.values(),
    ].map(textOf);

  return {
    find: (slugs) => Promise.resolve(pageAt(slugs)),
    findMarkdown: (slugs) => {
      const page = pageAt(slugs);

      return Promise.resolve(page === undefined ? undefined : textOf(page));
    },
    readCatalog: () => Promise.resolve(Object.fromEntries(pages)),
    readFullText: () => Promise.resolve(texts().join('\n\n')),
    readIndex: () => Promise.resolve(texts().join('\n')),
    readNavigation: () => Promise.resolve(texts()),
  };
};
