import type { ComponentType } from 'react';

import type { mdxComponents, TocHeading } from '#/libs/ui';

interface DocsPageBody {
  toc: TocHeading[];
}

interface DocsPageEntry {
  body: ComponentType<{
    components?: typeof mdxComponents;
  }>;
  description: string;
  /** the same promise on every call, which React's `use` reads at once when it has settled */
  load: () => Promise<DocsPageBody>;
  title: string;
}

export type { DocsPageEntry };
