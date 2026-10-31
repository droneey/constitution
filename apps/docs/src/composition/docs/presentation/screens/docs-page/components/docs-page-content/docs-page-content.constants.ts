import { Toc } from '#/libs/ui';

import { DocsToc, DocsTocDropdown } from '../../../../components';

const pageSlots = {
  toc: {
    dropdown: DocsTocDropdown,
    main: DocsToc,
    // Why: the page's bar and its dropdown serve every width, so it draws no popover.
    popover: (): undefined => undefined,
    provider: Toc,
  },
};

export { pageSlots };
