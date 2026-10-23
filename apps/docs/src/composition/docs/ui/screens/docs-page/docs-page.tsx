import type { ComponentType, ReactElement, RefCallback } from 'react';
import { Suspense, use, useState } from 'react';

import { useGlide } from '@droneey/design-web/react-dom';

import type { BaseSlots, FullSearchTriggerProps, PageTreeRoot, TOCItemType } from '#/libs/ui';
import {
  DocsBody,
  DocsDescription,
  DocsLayout,
  DocsPage,
  DocsTitle,
  FullSearchTrigger,
  SearchTrigger,
  SidebarProvider,
  TOCProvider,
} from '#/libs/ui';
import { mainContentId } from '#/shared/constants';

import { DocsLocationContext } from '../../../app/providers';
import { DocsToc, DocsTocDropdown } from '../../components/docs-toc';
import { glideLists, layoutOptions, mdxComponents } from '../../constants';
import { DocsSidebarWidget } from '../../widgets/docs-sidebar-widget';
import { DocsVersionWidget } from '../../widgets/docs-version-widget';

interface DocsPageScreenProps {
  href: string;
  page: DocsPageEntry;
  pageTree: PageTreeRoot;
  path: string;
}

function SidebarFields(props: FullSearchTriggerProps): ReactElement {
  return (
    <>
      <DocsVersionWidget />
      <FullSearchTrigger {...props} />
    </>
  );
}

const searchTrigger: BaseSlots['searchTrigger'] = {
  full: SidebarFields,
  sm: SearchTrigger,
};

const nothing = (): undefined => undefined;

// one sidebar at every width, so the library's drawer is left out
const sidebar = {
  drawer: nothing,
  main: DocsSidebarWidget,
  provider: SidebarProvider,
};

// every width keeps the page's bar and its dropdown, so the narrow screen's own TOC bar is left out
const pageSlots = {
  toc: {
    dropdown: DocsTocDropdown,
    main: DocsToc,
    popover: nothing,
    provider: TOCProvider,
  },
};

// the page panel remounts after the router resolves, so the heading takes focus as it attaches
const focusOnAttach: RefCallback<HTMLHeadingElement> = (heading) =>
  heading?.focus({
    preventScroll: true,
  });

function DocsContent({
  navigated,
  page,
  path,
}: {
  navigated: boolean;
  page: DocsPageEntry;
  path: string;
}): ReactElement {
  const { toc } = page.loaded() ?? use(page.load());
  const Body = page.body;
  // here, not in the root: its lists are on the page only once this content, which waits for its body, is hydrated
  useGlide(glideLists);

  // the page panel remounts on each page, so the TOC's observer does too, or it watches the old headings;
  // the page is a stop of the keyboard, as the sidebar's list is, so the arrows scroll its panel
  return (
    <DocsPage
      id={mainContentId}
      key={path}
      role='main'
      slots={pageSlots}
      tabIndex={0}
      toc={toc}
    >
      <DocsTitle
        ref={navigated ? focusOnAttach : undefined}
        tabIndex={-1}
      >
        {page.title}
      </DocsTitle>
      <DocsDescription
        className='text-base'
        data-docs-description=''
      >
        {page.description}
      </DocsDescription>
      <DocsBody data-docs-body=''>
        <Body components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export interface DocsPageEntry {
  body: ComponentType<{
    components?: typeof mdxComponents;
  }>;
  description: string;
  load: () => Promise<{
    toc: TOCItemType[];
  }>;
  /** undefined until the body has loaded */
  loaded: () =>
    | {
        toc: TOCItemType[];
      }
    | undefined;
  title: string;
}

/** a navigation inside the site moves focus to the page's heading; the first load leaves focus where it is */
export function DocsPageScreen({ href, page, pageTree, path }: DocsPageScreenProps): ReactElement {
  const [shown, setShown] = useState({
    navigated: false,
    path,
  });

  if (shown.path !== path) {
    setShown({
      navigated: true,
      path,
    });
  }

  return (
    <DocsLocationContext
      value={{
        href,
        path,
      }}
    >
      <DocsLayout
        {...layoutOptions}
        slots={{
          searchTrigger,
          sidebar,
        }}
        tree={pageTree}
      >
        <Suspense>
          <DocsContent
            navigated={shown.navigated}
            page={page}
            path={path}
          />
        </Suspense>
      </DocsLayout>
    </DocsLocationContext>
  );
}
