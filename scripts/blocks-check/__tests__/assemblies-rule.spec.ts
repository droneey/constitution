import { describe, expect, it } from 'bun:test';

import { assembliesRule } from '../rules/assemblies.rule';
import { loadFiles, validFiles, yamlOf } from './fixtures';

const ASSEMBLY = 'assemblies/web-vite.yml';

const assemblyWith = (blocks: readonly string[], sphere = 'web'): string =>
  yamlOf({
    blocks,
    name: 'web-vite',
    sphere,
  });

describe('assembliesRule', () => {
  it('should accept a sound tree', () => {
    // Act
    const findings = assembliesRule(loadFiles(validFiles()));

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a name that disagrees with the file', () => {
    // Arrange
    const files = validFiles();
    files[ASSEMBLY] = yamlOf({
      blocks: [
        'languages/typescript',
        'concerns/ui',
        'spheres/client',
        'spheres/web',
        'stacks/vite',
      ],
      name: 'browser-vite',
      sphere: 'web',
    });

    // Act
    const findings = assembliesRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'declares name "browser-vite" but its file is "web-vite.yml"',
        path: ASSEMBLY,
      },
    ]);
  });

  it('should report a sphere the list does not carry', () => {
    // Arrange
    const files = validFiles();
    files[ASSEMBLY] = assemblyWith(
      [
        'languages/typescript',
        'concerns/ui',
        'spheres/client',
        'spheres/web',
        'stacks/vite',
      ],
      'mobile',
    );

    // Act
    const findings = assembliesRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'names the sphere "mobile" but does not list "spheres/mobile"',
        path: ASSEMBLY,
      },
    ]);
  });

  it('should report core, an unknown block and a repeated block', () => {
    // Arrange
    const files = validFiles();
    files[ASSEMBLY] = assemblyWith([
      'core',
      'languages/typescript',
      'concerns/ui',
      'spheres/client',
      'spheres/web',
      'stacks/vite',
      'stacks/webpack',
      'concerns/ui',
    ]);

    // Act
    const findings = assembliesRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'lists core, which is part of every assembly and never listed',
        path: ASSEMBLY,
      },
      {
        message: 'lists an unknown block "stacks/webpack"',
        path: ASSEMBLY,
      },
      {
        message: 'lists "concerns/ui" twice',
        path: ASSEMBLY,
      },
    ]);
  });

  it('should report a missing requirement and a refinement listed too late', () => {
    // Arrange
    const files = validFiles();
    files[ASSEMBLY] = assemblyWith([
      'languages/typescript',
      'spheres/client',
      'spheres/web',
      'concerns/ui',
      'stacks/vite',
    ]);
    files['blocks/spheres/client/block.yml'] = yamlOf({
      chapters: {
        architecture: 'architecture.md',
      },
      kind: 'sphere',
      name: 'client',
      requires: [
        'languages/typescript',
        'languages/rust',
      ],
      summary: 'Needs a language nobody listed.',
    });
    files['blocks/languages/rust/block.yml'] = yamlOf({
      chapters: {},
      kind: 'language',
      name: 'rust',
      summary: 'Rust.',
    });

    // Act
    const findings = assembliesRule(loadFiles(files));

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          '"spheres/client" requires "languages/rust", which is not listed',
        path: ASSEMBLY,
      },
      {
        message:
          '"spheres/web" refines "concerns/ui", which must come earlier in the list',
        path: ASSEMBLY,
      },
    ]);
  });
});
