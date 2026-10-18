import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import type { TOCItemType } from '#/libs/ui';
import {
  ChevronDown,
  Popover,
  TextIcon,
  TOCItem,
  TOCScrollArea,
  useTOCItems,
  useTOCSelector,
} from '#/libs/ui';

declare module 'react' {
  /** a value handed to the styles is a custom property, which an inline style may hold */
  interface CSSProperties {
    [property: `--${string}`]: number | string;
  }
}

const ON_THIS_PAGE = 'On this page';

/** the deepest heading level that is a section; deeper headings are the entries under it */
const SECTION_DEPTH = 2;

/** sections are level 0; the entries under them, rules among them, level 1 */
const levelOf = (heading: TOCItemType): 0 | 1 => (heading.depth <= SECTION_DEPTH ? 0 : 1);

function TocList({ onSelect }: { onSelect?: () => void }): ReactElement {
  const headings = useTOCItems();

  return (
    <TOCScrollArea>
      <div
        className='relative flex flex-col'
        data-toc-list=''
      >
        {headings.map((heading) => (
          <TOCItem
            className='text-fd-muted-foreground transition-colors duration-(--duration-fast) ease-(--ease-standard) hover:text-fd-accent-foreground data-[active=true]:text-fd-primary'
            data-level={levelOf(heading)}
            href={heading.url}
            key={heading.url}
            onClick={onSelect}
          >
            <span data-toc-text=''>{heading.title}</span>
          </TOCItem>
        ))}
      </div>
    </TOCScrollArea>
  );
}

interface TrackedHeading {
  active: boolean;
  original: TOCItemType;
}

/** the topmost heading on screen, and where it sits among the page's headings; nowhere, before the first, when none is */
interface Topmost {
  heading: TOCItemType | undefined;
  position: number;
}

const selectTopmost = (headings: TrackedHeading[]): Topmost => {
  const position = headings.findIndex((heading) => heading.active);

  return {
    heading: headings[position]?.original,
    position,
  };
};

const selectProgress = (headings: Pick<TrackedHeading, 'active'>[]): number =>
  (headings.findLastIndex((heading) => heading.active) + 1) / Math.max(1, headings.length);

/** the topmost heading on screen, rolling in from the direction of scrolling */
function ActiveHeading({ fallback }: { fallback: ReactNode }): ReactElement {
  const { heading, position } = useTOCSelector(selectTopmost);
  const [shown, setShown] = useState({
    position,
    roll: 1,
  });
  if (shown.position !== position) {
    setShown({
      position,
      roll: Math.sign(position - shown.position),
    });
  }

  return (
    <span className='flex min-w-0 flex-1 overflow-hidden'>
      <span
        className='motion-safe:animate-fd-roll-in'
        data-toc-text=''
        key={heading?.url}
        style={{
          '--fd-roll': shown.roll,
        }}
      >
        {heading === undefined ? fallback : heading.title}
      </span>
    </span>
  );
}

const RING = {
  cx: 8,
  cy: 8,
  r: 6.5,
  // Stryker disable next-line StringLiteral: the ring's paint, which a spec could only restate
  fill: 'none',
};
const CIRCUMFERENCE = 2 * Math.PI * RING.r;

/** how far down the page the reader is */
function Progress(): ReactElement {
  const progress = useTOCSelector(selectProgress);

  return (
    <svg
      aria-label='Reading progress'
      aria-valuemax={1}
      aria-valuemin={0}
      aria-valuenow={progress}
      className='size-icon-md shrink-0 stroke-(length:--stroke-icon)'
      role='progressbar'
      viewBox='0 0 16 16'
    >
      <circle
        {...RING}
        className='stroke-current/25'
      />
      <circle
        {...RING}
        className='transition-(--toc-fill-property) duration-(--duration-base) ease-(--ease-out)'
        stroke='currentColor'
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        strokeLinecap='round'
        // Stryker disable ObjectLiteral,StringLiteral: only the ring's offset transitions, a choice of design a spec could only restate
        style={{
          '--toc-fill-property': 'stroke-dashoffset',
        }}
        // Stryker restore ObjectLiteral,StringLiteral
        transform='rotate(-90 8 8)'
      />
    </svg>
  );
}

/** the desktop TOC */
export function DocsToc(): ReactElement | undefined {
  const headings = useTOCItems();
  if (headings.length === 0) {
    return;
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: the library's id for its TOC column, which this column replaces in its slot and the site's layout styles by
    <div
      // biome-ignore lint/nursery/noTailwindArbitraryValue: the library's layout sizes its TOC column by --fd-toc-width, which the column sets on the layout through the library's layout: variant; no theme token names that width
      className='sticky top-0 flex h-full w-(--fd-toc-width) shrink-0 flex-col overflow-clip layout:[--fd-toc-width:--spacing(76)] @max-5xl:invisible @max-5xl:w-0 @max-5xl:ps-0'
      id='nd-toc'
    >
      <h3 className='inline-flex items-center text-sm text-fd-muted-foreground'>
        <TextIcon
          aria-hidden
          className='size-icon-md'
        />
        {ON_THIS_PAGE}
      </h3>
      <TocList />
    </div>
  );
}

/** the TOC in the page's header, when its column has no room */
export function DocsTocDropdown(): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root
      onOpenChange={setOpen}
      open={open}
    >
      <Popover.Trigger className='flex min-w-0 items-center rounded-lg text-start text-sm text-fd-muted-foreground transition-colors duration-(--duration-fast) ease-(--ease-standard) hover:bg-fd-accent hover:text-fd-accent-foreground data-popup-open:bg-fd-accent data-popup-open:text-fd-accent-foreground'>
        <Progress />
        <ActiveHeading fallback={ON_THIS_PAGE} />
        <ChevronDown
          aria-hidden
          className='size-icon-md shrink-0 transition-transform duration-(--duration-base) ease-(--ease-out) in-data-popup-open:rotate-180'
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          align='start'
          className='z-50'
          // Stryker disable ObjectLiteral,StringLiteral: the popup stays on its trigger's edge and side only when it would overflow the viewport, which a document without layout never reports
          collisionAvoidance={{
            align: 'none',
            fallbackAxisSide: 'none',
          }}
          // Stryker restore ObjectLiteral,StringLiteral
          positionMethod='fixed'
          sideOffset={8}
        >
          <Popover.Popup
            className='focusable flex max-h-(--available-height) flex-col rounded-xl border bg-fd-popover p-2xs text-fd-popover-foreground shadow-lg origin-(--transform-origin) data-closed:animate-fd-popover-out data-open:animate-fd-popover-in'
            data-toc-dropdown=''
          >
            <TocList onSelect={(): void => setOpen(false)} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
