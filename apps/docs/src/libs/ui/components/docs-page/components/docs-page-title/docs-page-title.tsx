import type { ComponentProps, ReactElement } from 'react';

type DocsPageTitleProps = Omit<ComponentProps<'h1'>, 'className'>;

export function DocsPageTitle(props: DocsPageTitleProps): ReactElement {
  return (
    <h1
      {...props}
      className='font-heading text-heading-xl'
    />
  );
}
