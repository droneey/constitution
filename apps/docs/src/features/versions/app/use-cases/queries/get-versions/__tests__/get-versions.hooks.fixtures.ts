import type { ReactNode } from 'react';
import { createElement } from 'react';

import type { RenderHookResult } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

import type { GetVersions } from '../../../../../domain/use-cases';
import { GetVersionsContext } from '../../../../providers';
import { useGetVersions } from '../get-versions.hooks';
import type { VersionsState } from '../get-versions.types';

interface RenderedVersionsState extends RenderHookResult<VersionsState, unknown> {
  provide: (getVersions: GetVersions | undefined) => void;
}

export const renderVersionsState = (
  getVersions: GetVersions | undefined,
): RenderedVersionsState => {
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

  const rendered = renderHook(useGetVersions, {
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
