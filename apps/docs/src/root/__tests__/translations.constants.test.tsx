import { afterEach, describe, expect, test } from 'bun:test';

import { cleanup, render, screen } from '@testing-library/react';
import { FrameworkProvider } from 'fumadocs-core/framework';
import { RootProvider } from 'fumadocs-ui/provider/base';

import { DefaultNotFound } from '#/libs/ui';

import { TRANSLATIONS } from '../constants';

afterEach(cleanup);

/** the notes in brackets tell a label's uses apart */
const labelOf = (key: string): string => key.replace(/\(.*$/, '');

const atTheRoot = (): string => '/';

const noParams = (): Record<string, string> => ({});

const staticRouter = (): {
  push: () => void;
  refresh: () => void;
} => ({
  push: (): void => undefined,
  refresh: (): void => undefined,
});

describe('translations', () => {
  test.each(Object.entries(TRANSLATIONS))(
    'should give the label %p in sentence case',
    (key, label) => {
      // Arrange
      const words = labelOf(key);

      // Act
      const sentenceCase = `${words.charAt(0)}${words.slice(1).toLowerCase()}`;

      // Assert
      expect(label).toBe(sentenceCase);
    },
  );

  test('should relabel the library pieces when the root provides them', () => {
    // Arrange
    const i18n = {
      translations: TRANSLATIONS,
    };

    // Act
    render(
      <FrameworkProvider
        useParams={noParams}
        usePathname={atTheRoot}
        useRouter={staticRouter}
      >
        <RootProvider
          i18n={i18n}
          theme={{
            enabled: false,
          }}
        >
          <DefaultNotFound />
        </RootProvider>
      </FrameworkProvider>,
    );

    // Assert
    expect(screen.getByRole('link').textContent).toBe('Back to home');
  });
});
