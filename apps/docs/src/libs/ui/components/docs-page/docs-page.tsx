import type { ComponentProps, ReactElement } from 'react';

import { DocsBody, DocsPage as FumadocsDocsPage } from 'fumadocs-ui/layouts/spacious/page';

import { DocsPageDescription, DocsPageTitle } from './components';

type DocsPageProps = ComponentProps<typeof FumadocsDocsPage>;

function DocsPageRoot(props: DocsPageProps): ReactElement {
  return <FumadocsDocsPage {...props} />;
}

const DocsPage: typeof DocsPageRoot & {
  Body: typeof DocsBody;
  Description: typeof DocsPageDescription;
  Title: typeof DocsPageTitle;
} = Object.assign(DocsPageRoot, {
  Body: DocsBody,
  Description: DocsPageDescription,
  Title: DocsPageTitle,
});

export type { DocsPageProps };
export { DocsPage };
