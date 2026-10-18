import type { ReactNode } from 'react';
import { createElement } from 'react';

import type { RenderHookResult } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

import type { GetVersions } from '../../../../../domain/use-cases';
import { GetVersionsContext } from '../../../../providers';
import type { Releases } from '../get-versions.hooks';
import { useVersions } from '../get-versions.hooks';

interface RenderedReleases extends RenderHookResult<Releases, unknown> {
  /** gives the hook another use case, as the root would on a new render */
  provide: (getVersions: GetVersions | undefined) => void;
}

/** the hook under the provider of the releases, with the use case the case gives */
export const renderReleases = (getVersions: GetVersions | undefined): RenderedReleases => {
  const provided = {
    current: getVersions,
  };
  const wrapper = ({ children }: { children: ReactNode }): ReactNode =>
    createElement(
      GetVersionsContext,
      {
        value: provided.current,
      },
      children,
    );
  const rendered = renderHook(useVersions, {
    wrapper,
  });

  return {
    ...rendered,
    provide: (next: GetVersions | undefined): void => {
      provided.current = next;
      rendered.rerender();
    },
  };
};
