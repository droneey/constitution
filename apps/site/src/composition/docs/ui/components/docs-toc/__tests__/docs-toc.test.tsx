import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import type { ReactElement } from 'react';

import type { RenderResult } from '@testing-library/react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { TOCItemType } from '#/libs/ui';
import { TOCProvider } from '#/libs/ui';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { tocFixture } from '../../../../__tests__/docs.fixtures';
import type { ViewportFake } from '../../../../__tests__/intersection-observer.fake';
import { viewportFake } from '../../../../__tests__/intersection-observer.fake';
import { DocsToc, DocsTocDropdown } from '../docs-toc';

let viewport: ViewportFake;

beforeEach(() => {
  viewport = viewportFake();
});

afterEach(() => {
  cleanup();
  viewport.restore();
});

/** the page's sections, which the TOC watches, beside the TOC under test */
const renderOnPage = (ui: ReactElement, toc: TOCItemType[] = tocFixture()): RenderResult =>
  render(
    <TOCProvider toc={toc}>
      {tocFixture().map((heading) => (
        <section
          id={heading.url.slice(1)}
          key={heading.url}
        />
      ))}
      {ui}
    </TOCProvider>,
  );

const scrollTo = (...ids: string[]): void => {
  act(() => viewport.show(...ids));
};

const openList = async (): Promise<void> => {
  await userEvent.click(screen.getByRole('button'));
  await screen.findByRole('dialog');
};

describe('DocsToc', () => {
  test('should show no column when the page has no headings', () => {
    // Arrange
    const toc: TOCItemType[] = [];

    // Act
    renderOnPage(<DocsToc />, toc);

    // Assert
    expect(
      screen.queryByRole('heading', {
        name: 'On this page',
      }),
    ).toBeNull();
  });

  test('should list the page headings under On this page when the page has headings', () => {
    // Arrange
    const toc = tocFixture();

    // Act
    renderOnPage(<DocsToc />, toc);

    // Assert
    expect([
      screen.getByRole('heading', {
        name: 'On this page',
      }).textContent,
      ...screen.getAllByRole('link').map((link) => link.getAttribute('href')),
    ]).toStrictEqual([
      'On this page',
      '#placement',
      '#layer',
      '#axis',
    ]);
  });

  test('should set sections at level 0 and the entries under them at level 1', () => {
    // Arrange
    const toc = tocFixture();

    // Act
    renderOnPage(<DocsToc />, toc);

    // Assert
    expect(screen.getAllByRole('link').map((link) => link.dataset.level)).toStrictEqual([
      '0',
      '1',
      '1',
    ]);
  });

  test('should pass the WCAG 2.2 A and AA scan', async () => {
    // Arrange
    renderOnPage(<DocsToc />);

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});

describe('DocsTocDropdown', () => {
  test('should read On this page before the reader reaches a heading', () => {
    // Arrange
    const dropdown = <DocsTocDropdown />;

    // Act
    renderOnPage(dropdown);

    // Assert
    expect(screen.getByRole('button').textContent).toBe('On this page');
  });

  test('should name the topmost heading on screen when the reader scrolls', () => {
    // Arrange
    renderOnPage(<DocsTocDropdown />);

    // Act
    scrollTo('layer', 'axis');

    // Assert
    expect(screen.getByRole('button').textContent).toBe('Layer');
  });

  test('should roll the label in from below before the reader reaches a heading', () => {
    // Arrange
    const dropdown = <DocsTocDropdown />;

    // Act
    renderOnPage(dropdown);

    // Assert
    expect(screen.getByText('On this page').style.getPropertyValue('--fd-roll')).toBe('1');
  });

  test('should roll the heading in from below when the reader scrolls down', () => {
    // Arrange
    renderOnPage(<DocsTocDropdown />);
    scrollTo('placement');

    // Act
    scrollTo('layer');

    // Assert
    expect(screen.getByText('Layer').style.getPropertyValue('--fd-roll')).toBe('1');
  });

  test('should roll the heading in from above when the reader scrolls up', () => {
    // Arrange
    renderOnPage(<DocsTocDropdown />);
    scrollTo('layer');

    // Act
    scrollTo('placement');

    // Assert
    expect(screen.getByText('Placement').style.getPropertyValue('--fd-roll')).toBe('-1');
  });

  test('should show no progress when the page has no headings', () => {
    // Arrange
    const toc: TOCItemType[] = [];

    // Act
    renderOnPage(<DocsTocDropdown />, toc);

    // Assert
    expect(
      screen
        .getByRole('progressbar', {
          name: 'Reading progress',
        })
        .getAttribute('aria-valuenow'),
    ).toBe('0');
  });

  test('should show the share read up to the last heading on screen when the reader scrolls', () => {
    // Arrange
    renderOnPage(<DocsTocDropdown />);

    // Act
    scrollTo('placement', 'layer');

    // Assert
    expect(
      screen
        .getByRole('progressbar', {
          name: 'Reading progress',
        })
        .getAttribute('aria-valuenow'),
    ).toBe('0.6666666666666666');
  });

  test('should leave the unread share of the ring empty when the reader scrolls', () => {
    // Arrange
    renderOnPage(<DocsTocDropdown />);

    // Act
    scrollTo('placement', 'layer');

    // Assert
    expect(
      screen
        .getByRole('progressbar', {
          name: 'Reading progress',
        })
        .lastElementChild?.getAttribute('stroke-dashoffset'),
    ).toBe('13.613568165555773');
  });

  test('should draw the ring as an outline whose fill alone moves', () => {
    // Arrange
    const dropdown = <DocsTocDropdown />;

    // Act
    renderOnPage(dropdown);

    // Assert
    const ring = screen.getByRole('progressbar', {
      name: 'Reading progress',
    });
    expect([
      ring.firstElementChild?.getAttribute('fill'),
      ring.lastElementChild?.getAttribute('fill'),
      ring.lastElementChild?.getAttribute('style'),
    ]).toStrictEqual([
      'none',
      'none',
      '--toc-fill-property: stroke-dashoffset;',
    ]);
  });

  test('should list the page headings when the reader opens it', async () => {
    // Arrange
    renderOnPage(<DocsTocDropdown />);

    // Act
    await openList();

    // Assert
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toStrictEqual([
      'Placement',
      'Layer',
      'Axis',
    ]);
  });

  test('should close the list when the reader picks a heading', async () => {
    // Arrange
    renderOnPage(<DocsTocDropdown />);
    await openList();

    // Act
    await userEvent.click(
      screen.getByRole('link', {
        name: 'Layer',
      }),
    );

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  test('should pass the WCAG 2.2 A and AA scan when the reader opens it', async () => {
    // Arrange
    renderOnPage(<DocsTocDropdown />);
    await openList();

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
