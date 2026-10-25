import type { ComponentProps, ReactElement } from 'react';

import {
  DocsBody,
  DocsDescription,
  DocsTitle,
  DocsPage as FumadocsDocsPage,
} from 'fumadocs-ui/layouts/spacious/page';

type DocsPageProps = ComponentProps<typeof FumadocsDocsPage>;

function DocsPageRoot(props: DocsPageProps): ReactElement {
  return <FumadocsDocsPage {...props} />;
}

const DocsPage: typeof DocsPageRoot & {
  Body: typeof DocsBody;
  Description: typeof DocsDescription;
  Title: typeof DocsTitle;
} = Object.assign(DocsPageRoot, {
  Body: DocsBody,
  Description: DocsDescription,
  Title: DocsTitle,
});

export type { DocsPageProps };
export { DocsPage };
