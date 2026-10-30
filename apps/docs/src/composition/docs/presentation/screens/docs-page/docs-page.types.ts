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
  // Why: React's `use` suspends on every new promise, so each call gives the same one.
  load: () => Promise<DocsPageBody>;
  title: string;
}

export type { DocsPageEntry };
