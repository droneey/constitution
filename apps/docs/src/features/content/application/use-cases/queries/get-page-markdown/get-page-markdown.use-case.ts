import type { PageSlugs } from '../../../../domain/page/value-objects';
import type { PageQueries } from '../../../contracts';

export type GetPageMarkdown = (slugs: PageSlugs) => Promise<string | undefined>;

export const createGetPageMarkdown =
  (pageQueries: PageQueries<unknown>): GetPageMarkdown =>
  (slugs: PageSlugs): Promise<string | undefined> =>
    pageQueries.findMarkdown(slugs);
