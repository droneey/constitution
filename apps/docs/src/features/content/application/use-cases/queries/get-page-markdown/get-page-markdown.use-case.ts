import type { PageSlugs } from '../../../../domain/page/value-objects';
import type { PagesQueryRepository } from '../../../contracts';

export type GetPageMarkdown = (slugs: PageSlugs) => Promise<string | undefined>;

export const createGetPageMarkdown =
  (pages: PagesQueryRepository<unknown>): GetPageMarkdown =>
  (slugs: PageSlugs): Promise<string | undefined> =>
    pages.findMarkdown(slugs);
