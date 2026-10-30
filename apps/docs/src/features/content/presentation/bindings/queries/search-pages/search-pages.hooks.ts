import { use, useCallback } from 'react';

import type { SearchHit, SearchState } from '#/libs/ui';
import { useSearch } from '#/libs/ui';

import type { SearchResult } from '../../../../domain/entities';
import { SearchPagesContext } from '../../../providers';

const hitOf = ({ breadcrumbs, kind, table, ...found }: SearchResult): SearchHit => ({
  ...found,
  // Stryker disable next-line ConditionalExpression: the dialog shows no breadcrumbs for an empty list as for none
  ...(breadcrumbs.length === 0
    ? {}
    : {
        breadcrumbs: [
          ...breadcrumbs,
        ],
      }),
  // Stryker disable next-line ConditionalExpression: the dialog gathers no rows under a table that is undefined, as under none
  ...(table === undefined
    ? {}
    : {
        table,
      }),
  type: kind,
});

export function useSearchPages(): SearchState {
  const searchPages = use(SearchPagesContext);

  // biome-ignore lint/plugin/react-compiler-on: the search runs again whenever its function changes, and Fumadocs' hook, which the Compiler skips, compares it by identity
  const run = useCallback(
    async (query: string): Promise<SearchHit[]> =>
      searchPages === undefined ? [] : (await searchPages(query)).map(hitOf),
    [
      searchPages,
    ],
  );

  return useSearch(run);
}
