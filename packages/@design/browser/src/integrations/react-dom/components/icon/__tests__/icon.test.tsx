import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, render, screen } from '@testing-library/react';

import { componentViolationsIn } from '../../../__tests__/axe.fixtures';
import {
  applyStylesheet,
  removeStylesheets,
  TOKEN_VALUES,
} from '../../../__tests__/styles.fixtures';
import { IconName } from '../../../icons';
import { Icon } from '../icon';

afterEach(() => {
  cleanup();
  removeStylesheets();
});

describe('Icon', () => {
  it.each(Object.values(IconName))('should draw %s hidden from assistive technology', (name) => {
    // Arrange
    const tree = (
      <p>
        Rules
        <Icon name={name} />
      </p>
    );

    // Act
    render(tree);

    // Assert
    expect(screen.getByText('Rules').lastElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should name what it means to assistive technology when it has a label', () => {
    // Arrange
    const tree = (
      <Icon
        label='Current version'
        name={IconName.Selected}
      />
    );

    // Act
    render(tree);

    // Assert
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Current version');
  });

  it("should take its size and stroke from the theme's tokens and keep the caller's own class", async () => {
    // Arrange
    await applyStylesheet(new URL('../icon.css', import.meta.url));

    const tree = (
      <Icon
        className='spins'
        label='Expand'
        name={IconName.Expand}
      />
    );

    // Act
    render(tree);

    // Assert
    const icon = screen.getByRole('img');
    const style = getComputedStyle(icon);

    expect({
      hasOwnClass: icon.classList.contains('spins'),
      height: style.height,
      strokeWidth: style.getPropertyValue('stroke-width'),
      width: style.width,
    }).toStrictEqual({
      hasOwnClass: true,
      height: TOKEN_VALUES['--size-icon-md'],
      strokeWidth: TOKEN_VALUES['--stroke-icon'],
      width: TOKEN_VALUES['--size-icon-md'],
    });
  });

  it.each([
    {
      condition: 'it decorates a text',
      tree: (
        <p>
          Rules
          <Icon name={IconName.Expand} />
        </p>
      ),
    },
    {
      condition: 'it has a label',
      tree: (
        <Icon
          label='Current version'
          name={IconName.Selected}
        />
      ),
    },
  ])('should break no rule of WCAG A and AA when $condition', async ({ tree }) => {
    // Arrange
    render(tree);

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
