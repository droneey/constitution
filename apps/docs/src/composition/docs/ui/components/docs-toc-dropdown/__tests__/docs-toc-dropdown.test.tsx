import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { TocHeading } from '#/libs/ui';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import type { ViewportFake } from '../../../../__tests__/intersection-observer.fake';
import { viewportFake } from '../../../../__tests__/intersection-observer.fake';
import { renderOnPage } from '../../../../__tests__/toc.fixtures';
import { ON_THIS_PAGE_LABEL } from '../../../constants';
import { DocsTocDropdown } from '../docs-toc-dropdown';

let viewport: ViewportFake;

beforeEach(() => {
  viewport = viewportFake();
});

afterEach(() => {
  cleanup();
  viewport.restore();
});

const scrollTo = (...ids: string[]): void => {
  act(() => viewport.show(...ids));
};

const openList = async (): Promise<void> => {
  await userEvent.click(screen.getByRole('button'));
  await screen.findByRole('dialog');
};

describe('DocsTocDropdown', () => {
  test('should read On this page before the reader reaches a heading', () => {
    // Arrange
    const dropdown = <DocsTocDropdown />;

    // Act
    renderOnPage(dropdown);

    // Assert
    expect(screen.getByRole('button').textContent).toBe(ON_THIS_PAGE_LABEL);
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
    const toc: TocHeading[] = [];

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
    const fill = screen.getByRole('progressbar', {
      name: 'Reading progress',
    }).lastElementChild;
    const circumference = 2 * Math.PI * Number(fill?.getAttribute('r'));

    expect({
      dash: Number(fill?.getAttribute('stroke-dasharray')) / circumference,
      unread: Number(fill?.getAttribute('stroke-dashoffset')) / circumference,
    }).toStrictEqual({
      dash: 1,
      unread: expect.closeTo(1 / 3),
    });
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
