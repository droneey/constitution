import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createFakePageSearch } from '#/__tests__/page-search.fake';
import { createSearchPages, SearchResultKind } from '#/features/content';
import { FullSearchTrigger } from '#/libs/ui';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs } from '../../../../__tests__/docs.fixtures';

const searchPages = createSearchPages(
  createFakePageSearch([
    {
      breadcrumbs: [],
      content: 'Write a pack',
      id: '/docs/guides/write-a-pack',
      kind: SearchResultKind.Page,
      url: '/docs/guides/write-a-pack',
    },
    {
      breadcrumbs: [],
      content: 'Choose blocks',
      id: '/docs/guides/choose-blocks',
      kind: SearchResultKind.Page,
      url: '/docs/guides/choose-blocks',
    },
  ]),
);

afterEach(cleanup);

const openSearch = async (): Promise<void> => {
  renderInDocs(<FullSearchTrigger />, {
    searchPages,
  });
  await userEvent.click(screen.getByRole('button'));
  await screen.findByRole('dialog');
};

describe('DocsSearchWidget', () => {
  it('should list the pages that match when the reader types a query', async () => {
    // Arrange
    await openSearch();

    // Act
    await userEvent.type(
      screen.getByRole('combobox', {
        name: 'Search',
      }),
      'pack',
    );

    // Assert
    expect(
      (await screen.findAllByRole('option')).map((option) => option.textContent),
    ).toStrictEqual([
      'Write a pack',
    ]);
  });

  it('should close when the reader presses close', async () => {
    // Arrange
    await openSearch();

    // Act
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Close Search',
      }),
    );

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('should pass the WCAG 2.2 A and AA scan when it lists results', async () => {
    // Arrange
    await openSearch();
    await userEvent.type(
      screen.getByRole('combobox', {
        name: 'Search',
      }),
      'pack',
    );
    await screen.findAllByRole('option');

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
