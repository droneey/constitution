import type { ReactElement } from 'react';

import type { TocHeading } from '#/libs/ui';
import { Toc, useTocItems } from '#/libs/ui';

import { SECTION_DEPTH, TocLevel } from './docs-toc-list.constants';

interface DocsTocListProps {
  onSelect?: () => void;
}

const levelOf = (heading: TocHeading): TocLevel =>
  heading.depth <= SECTION_DEPTH ? TocLevel.Section : TocLevel.Entry;

export function DocsTocList({ onSelect }: DocsTocListProps): ReactElement {
  const headings = useTocItems();

  return (
    <Toc.ScrollArea>
      <div
        className='relative flex flex-col'
        data-testid='toc-list'
        data-toc-list=''
      >
        {headings.map((heading) => (
          <Toc.Item
            className='text-fd-muted-foreground transition-colors duration-(--duration-fast) ease-(--ease-standard) hover:text-fd-accent-foreground data-[active=true]:text-fd-primary'
            data-level={levelOf(heading)}
            href={heading.url}
            key={heading.url}
            onClick={onSelect}
          >
            <span data-toc-text=''>{heading.title}</span>
          </Toc.Item>
        ))}
      </div>
    </Toc.ScrollArea>
  );
}
