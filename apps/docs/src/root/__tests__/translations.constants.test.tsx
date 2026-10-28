import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, render, screen } from '@testing-library/react';
import { FrameworkProvider } from 'fumadocs-core/framework';
import { RootProvider } from 'fumadocs-ui/provider/base';

import { DefaultNotFound } from '#/libs/ui';

import { TRANSLATIONS } from '../constants';

afterEach(cleanup);

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
  it('should relabel the library pieces when the root provides them', () => {
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
    // biome-ignore lint/plugin/case-pins-meaning-never-wording: the one golden case of a label the root provider relabels
    expect(screen.getByRole('link').textContent).toBe('Back to home');
  });
});
