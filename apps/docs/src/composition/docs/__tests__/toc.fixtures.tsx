import type { ReactElement } from 'react';

import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';

import type { TocHeading } from '#/libs/ui';
import { Toc } from '#/libs/ui';

import { tocFixture } from './docs.fixtures';

/** with the page's sections, which the TOC watches */
const renderOnPage = (ui: ReactElement, toc: TocHeading[] = tocFixture()): RenderResult =>
  render(
    <Toc toc={toc}>
      {tocFixture().map((heading) => (
        <section
          id={heading.url.slice(1)}
          key={heading.url}
        />
      ))}
      {ui}
    </Toc>,
  );

export { renderOnPage };
