import { afterEach, describe, expect, it, mock } from 'bun:test';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { Popover, PopoverPanel, PopoverTrigger, PopoverWidth } from '../components';
import { applyStylesheet, TOKENS } from './styles.fixtures';

afterEach(() => {
  cleanup();
  document.head.replaceChildren();
});

describe('Popover', () => {
  it('should open its panel, as wide as its content, from its trigger', async () => {
    // Arrange
    render(
      <Popover>
        <PopoverTrigger>Versions</PopoverTrigger>
        <PopoverPanel>0.80.0</PopoverPanel>
      </Popover>,
    );

    // Act
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Versions',
      }),
    );

    // Assert
    const panel = await screen.findByRole('dialog');
    expect({
      text: panel.textContent,
      width: panel.getAttribute('data-width'),
    }).toStrictEqual({
      text: '0.80.0',
      width: PopoverWidth.Content,
    });
  });

  it('should tell its owner when it opens', () => {
    // Arrange
    const onOpenChange = mock((_open: boolean): void => undefined);
    render(
      <Popover
        onOpenChange={onOpenChange}
        open={false}
      >
        <PopoverTrigger>Versions</PopoverTrigger>
        <PopoverPanel>0.80.0</PopoverPanel>
      </Popover>,
    );

    // Act
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Versions',
      }),
    );

    // Assert
    expect(onOpenChange.mock.calls.map(([open]) => open)).toStrictEqual([
      true,
    ]);
  });

  it('should draw its panel in the width it is given when it opens from the start', async () => {
    // Arrange
    const tree = (
      <Popover defaultOpen>
        <PopoverTrigger>On this page</PopoverTrigger>
        <PopoverPanel width={PopoverWidth.Available}>Contents</PopoverPanel>
      </Popover>
    );

    // Act
    render(tree);

    // Assert
    expect((await screen.findByRole('dialog')).getAttribute('data-width')).toBe(
      PopoverWidth.Available,
    );
  });

  it("should draw its panel on the raised surface the theme's tokens give it", async () => {
    // Arrange
    await applyStylesheet(new URL('../components/popover/popover.css', import.meta.url));
    const tree = (
      <Popover defaultOpen>
        <PopoverTrigger>Versions</PopoverTrigger>
        <PopoverPanel>0.80.0</PopoverPanel>
      </Popover>
    );

    // Act
    render(tree);

    // Assert
    const style = getComputedStyle(await screen.findByRole('dialog'));
    expect({
      backgroundColor: style.backgroundColor,
      borderColor: style.borderTopColor,
      borderRadius: style.borderTopLeftRadius,
      boxShadow: style.boxShadow,
      color: style.color,
      minWidth: style.minWidth,
      padding: style.paddingTop,
    }).toStrictEqual({
      backgroundColor: TOKENS['--color-surface-level-1'],
      borderColor: TOKENS['--color-border-base'],
      borderRadius: TOKENS['--radius-surface-raised'],
      boxShadow: TOKENS['--shadow-surface-raised'],
      color: TOKENS['--color-text-primary'],
      minWidth: TOKENS['--size-popup-min'],
      padding: TOKENS['--spacing-2xs'],
    });
  });
});
