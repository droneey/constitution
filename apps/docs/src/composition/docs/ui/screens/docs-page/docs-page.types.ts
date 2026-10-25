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
  load: () => Promise<DocsPageBody>;
  loaded: () => DocsPageBody | undefined;
  title: string;
}

export type { DocsPageEntry };
