import { describe, expect, it } from 'bun:test';

import { inCatalogueOrder } from '../catalogue-order.utils';

describe('inCatalogueOrder', () => {
  it('should order by layer, id, folder, then passport, chapters, seams and other files by axis and name when the files are shuffled', () => {
    // Arrange
    const files = [
      'blocks/implementations/biome/workflow/hooks.md',
      'blocks/domains/ui/foundation/deep/x.md',
      'blocks/contexts/languages/python/python.md',
      'blocks/domains/ui-kit/ui-kit.md',
      'blocks/core/notes.md',
      'blocks/domains/ui/architecture/with/deep/x.md',
      'blocks/core/architecture/with/api.md',
      'blocks/domains/ui/deep/x.md',
      'blocks/core/foundation/with/ui.md',
      'blocks/domains/ui/foundation/screens.md',
      'blocks/implementations/biome/biome.md',
      'blocks/core/workflow/agents.md',
      'blocks/README.md',
      'blocks/domains/ui/ui.md',
      'blocks/contexts/x.md',
      'blocks/core/architecture/layers.md',
      'blocks/contexts/platforms/web/web.md',
      'blocks/domains/ui/foundation/forms.md',
      'blocks/core/foundation/code.md',
      'blocks/domains/api/api.md',
      'blocks/core/core.md',
      'blocks/implementations/1password/1password.md',
      'blocks/contexts/languages/4d/4d.md',
      'blocks/contexts/languages/python/foundation/types.md',
      'blocks/domains/ui/foundations',
    ].map((path) => ({
      path,
    }));

    // Act
    const ordered = inCatalogueOrder(files);

    // Assert
    expect(ordered).toStrictEqual(
      [
        'blocks/core/core.md',
        'blocks/core/foundation/code.md',
        'blocks/core/architecture/layers.md',
        'blocks/core/workflow/agents.md',
        'blocks/core/foundation/with/ui.md',
        'blocks/core/architecture/with/api.md',
        'blocks/core/notes.md',
        'blocks/domains/api/api.md',
        'blocks/domains/ui/ui.md',
        'blocks/domains/ui/foundation/forms.md',
        'blocks/domains/ui/foundation/screens.md',
        'blocks/domains/ui/deep/x.md',
        'blocks/domains/ui/foundation/deep/x.md',
        'blocks/domains/ui/foundations',
        'blocks/domains/ui/architecture/with/deep/x.md',
        'blocks/domains/ui-kit/ui-kit.md',
        'blocks/contexts/platforms/web/web.md',
        'blocks/contexts/x.md',
        'blocks/contexts/languages/4d/4d.md',
        'blocks/contexts/languages/python/python.md',
        'blocks/contexts/languages/python/foundation/types.md',
        'blocks/README.md',
        'blocks/implementations/1password/1password.md',
        'blocks/implementations/biome/biome.md',
        'blocks/implementations/biome/workflow/hooks.md',
      ].map((path) => ({
        path,
      })),
    );
  });
});
