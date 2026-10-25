import { describe, expect, it } from 'bun:test';

import { PROJECT } from '#/__tests__/project-place.fixtures';
import { createFakeProjectSource } from '#/__tests__/project-source.fake';
import { ConfigReadStatus, WarningCode } from '#/kernel/entities';

import { UNBIOMED, warnedOf, wiringOf } from '../../../../../__tests__/wiring.fixtures';
import { checkPresets } from '../check.use-case';

describe('checkPresets', () => {
  it('should give nothing when no project lies around the start folder', () => {
    // Arrange
    const wiring = wiringOf();

    // Act
    const warnings = checkPresets({
      files: wiring.files,
      parser: wiring.parser,
      source: createFakeProjectSource(),
      start: PROJECT,
      workingTree: wiring.workingTree,
    });

    // Assert
    expect(warnings).toBeUndefined();
  });

  it("should give the declaration's warnings, then the wiring's, when both have some", () => {
    // Arrange
    const wiring = wiringOf({
      project: UNBIOMED,
    });
    const source = createFakeProjectSource({
      declaration: {
        packs: [],
        resolution: {
          ...wiring.resolution,
          warnings: [
            {
              code: WarningCode.Unknown,
              message: 'acme is not a block',
            },
          ],
        },
        status: ConfigReadStatus.Parsed,
      },
      place: {
        releaseFolder: wiring.releaseFolder,
        project: wiring.project,
      },
    });

    // Act
    const warnings = checkPresets({
      files: wiring.files,
      parser: wiring.parser,
      source,
      start: PROJECT,
      workingTree: wiring.workingTree,
    });

    // Assert
    expect(warnedOf(warnings ?? [])).toStrictEqual([
      [
        'unknown',
        'acme',
      ],
      [
        'wiring',
        'biome',
        '.',
      ],
    ]);
  });
});
