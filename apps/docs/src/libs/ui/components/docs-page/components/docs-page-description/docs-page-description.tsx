import type { ComponentProps, ReactElement } from 'react';

type DocsPageDescriptionProps = Omit<ComponentProps<'p'>, 'className'>;

export function DocsPageDescription(props: DocsPageDescriptionProps): ReactElement {
  return (
    <p
      {...props}
      className='font-body text-body-md text-fd-muted-foreground'
    />
  );
}
