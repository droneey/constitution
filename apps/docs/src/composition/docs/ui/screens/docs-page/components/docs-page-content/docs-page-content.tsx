import type { ReactElement, RefCallback } from 'react';
import { use } from 'react';

import { useGlide } from '@droneey/design-browser/react-dom';

import { DocsPage, mdxComponents, useSidebar } from '#/libs/ui';
import { MAIN_CONTENT_ID } from '#/shared/constants';

import { useCollapsedOnNarrowScreen } from '../../../../../app/use-cases';
import { GLIDE_LISTS } from '../../../../constants';
import type { DocsPageEntry } from '../../docs-page.types';
import { pageSlots } from './docs-page-content.constants';

interface DocsPageContentProps {
  hasNavigated: boolean;
  page: DocsPageEntry;
  path: string;
}

// the page panel remounts after the router resolves, so the heading takes focus as it attaches
const focusOnAttach: RefCallback<HTMLHeadingElement> = (heading) =>
  heading?.focus({
    preventScroll: true,
  });

export function DocsPageContent({ hasNavigated, page, path }: DocsPageContentProps): ReactElement {
  const { toc } = use(page.load());
  const Body = page.body;

  const { setCollapsed } = useSidebar();

  // here, not in the root: the lists are on the page only once this content, which waits for its body, is hydrated
  useGlide(GLIDE_LISTS);
  // here, not in the sidebar: collapsed before this content hydrates, its header would no longer
  // match the server's, rendered beside an open sidebar
  useCollapsedOnNarrowScreen({
    collapse: () => setCollapsed(true),
    path,
  });

  // keyed by the path, the panel and the TOC's observer remount on each page, or it watches the old
  // headings; the page is a stop of the keyboard, as the sidebar's list is, so the arrows scroll it
  return (
    <DocsPage
      id={MAIN_CONTENT_ID}
      key={path}
      role='main'
      slots={pageSlots}
      tabIndex={0}
      toc={toc}
    >
      <DocsPage.Title
        ref={hasNavigated ? focusOnAttach : undefined}
        tabIndex={-1}
      >
        {page.title}
      </DocsPage.Title>
      <DocsPage.Description
        className='text-base'
        data-docs-description=''
      >
        {page.description}
      </DocsPage.Description>
      <DocsPage.Body data-docs-body=''>
        <Body components={mdxComponents} />
      </DocsPage.Body>
    </DocsPage>
  );
}
