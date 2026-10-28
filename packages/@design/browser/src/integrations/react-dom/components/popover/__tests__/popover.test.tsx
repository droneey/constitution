import { afterEach, describe, expect, it, mock } from 'bun:test';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { componentViolationsIn } from '../../../__tests__/axe.fixtures';
import {
  applyStylesheet,
  removeStylesheets,
  TOKEN_VALUES,
} from '../../../__tests__/styles.fixtures';
import { Popover } from '../popover';
import { PopoverWidth } from '../popover.constants';

afterEach(() => {
  cleanup();
  removeStylesheets();
});

describe('Popover', () => {
  it('should open its panel, as wide as its content, from its trigger', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <Popover>
        <Popover.Trigger>Versions</Popover.Trigger>
        <Popover.Panel>0.80.0</Popover.Panel>
      </Popover>,
    );

    // Act
    await user.click(
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

  it('should tell its owner when it opens', async () => {
    // Arrange
    const user = userEvent.setup();
    const onOpenChange = mock((_open: boolean): void => undefined);

    render(
      <Popover
        onOpenChange={onOpenChange}
        open={false}
      >
        <Popover.Trigger>Versions</Popover.Trigger>
        <Popover.Panel>0.80.0</Popover.Panel>
      </Popover>,
    );

    // Act
    await user.click(
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
        <Popover.Trigger>On this page</Popover.Trigger>
        <Popover.Panel width={PopoverWidth.Available}>Contents</Popover.Panel>
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
    await applyStylesheet(new URL('../popover.css', import.meta.url));

    const tree = (
      <Popover defaultOpen>
        <Popover.Trigger>Versions</Popover.Trigger>
        <Popover.Panel>0.80.0</Popover.Panel>
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
      backgroundColor: TOKEN_VALUES['--color-surface-level-1'],
      borderColor: TOKEN_VALUES['--color-border-base'],
      borderRadius: TOKEN_VALUES['--radius-surface-raised'],
      boxShadow: TOKEN_VALUES['--shadow-surface-raised'],
      color: TOKEN_VALUES['--color-text-primary'],
      minWidth: TOKEN_VALUES['--size-popup-min'],
      padding: TOKEN_VALUES['--spacing-2xs'],
    });
  });

  it('should open its panel when Enter is pressed on its trigger', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <Popover>
        <Popover.Trigger>Versions</Popover.Trigger>
        <Popover.Panel>0.80.0</Popover.Panel>
      </Popover>,
    );
    await user.tab();

    // Act
    await user.keyboard('{Enter}');

    // Assert
    expect((await screen.findByRole('dialog')).textContent).toBe('0.80.0');
  });

  it('should close its panel and give the focus back to its trigger when Escape is pressed', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <Popover>
        <Popover.Trigger>Versions</Popover.Trigger>
        <Popover.Panel>0.80.0</Popover.Panel>
      </Popover>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');

    // Act
    await user.keyboard('{Escape}');

    // Assert
    await waitFor(() => {
      expect({
        focused: document.activeElement,
        panels: screen.queryAllByRole('dialog'),
      }).toStrictEqual({
        focused: screen.getByRole('button', {
          name: 'Versions',
        }),
        panels: [],
      });
    });
  });

  it('should name its panel by the label it is given', async () => {
    // Arrange
    const tree = (
      <Popover defaultOpen>
        <Popover.Trigger>Versions</Popover.Trigger>
        <Popover.Panel aria-label='Versions of the rules'>0.80.0</Popover.Panel>
      </Popover>
    );

    // Act
    render(tree);

    // Assert
    expect(
      (
        await screen.findByRole('dialog', {
          name: 'Versions of the rules',
        })
      ).textContent,
    ).toBe('0.80.0');
  });

  it('should break no rule of WCAG A and AA when its panel is open', async () => {
    // Arrange
    render(
      <Popover defaultOpen>
        <Popover.Trigger>Versions</Popover.Trigger>
        <Popover.Panel aria-label='Versions of the rules'>0.80.0</Popover.Panel>
      </Popover>,
    );
    await screen.findByRole('dialog');

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
