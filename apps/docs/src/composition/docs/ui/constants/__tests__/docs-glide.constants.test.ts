import { afterEach, describe, expect, test } from 'bun:test';

import { useGlide } from '@droneey/design-browser/react-dom';
import { cleanup, renderHook, screen, within } from '@testing-library/react';

import { GLIDE_LISTS } from '../docs-glide.constants';
import {
  mountList,
  placeOf,
  pointAt,
  searchMarkup,
  themeMenuMarkup,
  tocMarkup,
  versionsMarkup,
} from './docs-glide.fixtures';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('glideLists', () => {
  test.each([
    {
      list: 'the versions',
      markup: versionsMarkup(),
      pointed: 'v0.69.2',
      place: {
        opacity: '1',
        row: 'v0.69.2',
      },
    },
    {
      list: 'the versions',
      markup: versionsMarkup(),
      pointed: 'v0.70.0',
      place: {
        opacity: '0',
        row: 'v0.70.0',
      },
    },
    {
      list: 'the page contents',
      markup: tocMarkup(),
      pointed: 'Layers',
      place: {
        opacity: '1',
        row: 'Layers',
      },
    },
  ])(
    'should slide the block of $list under $pointed, faded where the row shows a fill of its own, when the mouse is over it',
    ({ markup, pointed, place }) => {
      // Arrange
      const list = mountList(markup);

      renderHook(() => useGlide(GLIDE_LISTS));

      // Act
      pointAt(screen.getByText(pointed));

      // Assert
      expect(placeOf(list)).toStrictEqual(place);
    },
  );

  test.each([
    {
      list: 'the search results',
      markup: searchMarkup('Layers'),
      listOf: (root: HTMLElement): HTMLElement => root,
      place: {
        opacity: '1',
        row: 'Layers',
      },
    },
    {
      list: 'the theme menu',
      markup: themeMenuMarkup('System'),
      listOf: (root: HTMLElement): HTMLElement => root,
      place: {
        opacity: '1',
        row: 'System',
      },
    },
    {
      list: 'the theme modes',
      markup: themeMenuMarkup('Light'),
      listOf: (root: HTMLElement): HTMLElement => within(root).getByRole('group'),
      place: {
        opacity: '1',
        row: 'Light',
      },
    },
    {
      list: 'the theme modes',
      markup: themeMenuMarkup('Dark'),
      listOf: (root: HTMLElement): HTMLElement => within(root).getByRole('group'),
      place: {
        opacity: '0',
        row: 'Dark',
      },
    },
  ])(
    'should slide the block of $list under the row it marks, faded where the row shows a fill of its own, when a row is marked',
    ({ markup, listOf, place }) => {
      // Arrange
      const root = mountList(markup);

      // Act
      renderHook(() => useGlide(GLIDE_LISTS));

      // Assert
      expect(placeOf(listOf(root))).toStrictEqual(place);
    },
  );
});
