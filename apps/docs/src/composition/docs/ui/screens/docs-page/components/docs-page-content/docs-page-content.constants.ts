import { Toc } from '#/libs/ui';

import { DocsToc, DocsTocDropdown } from '../../../../components';

// the page's bar and its dropdown serve every width, so the narrow screen's own bar is left out
const pageSlots = {
  toc: {
    dropdown: DocsTocDropdown,
    main: DocsToc,
    popover: (): undefined => undefined,
    provider: Toc,
  },
};

export { pageSlots };
