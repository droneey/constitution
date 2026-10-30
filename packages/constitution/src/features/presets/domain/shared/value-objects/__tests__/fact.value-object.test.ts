import { describe, expect, it } from 'bun:test';

import type { Fact } from '../fact.value-object';
import { FactKind, FactName, Fact as Facts } from '../fact.value-object';

describe('Fact', () => {
  it.each<{
    fact: Fact;
    text: string;
  }>([
    ...Object.values(FactName).map((name) => ({
      fact: {
        kind: FactKind.Named,
        name,
      } satisfies Fact,
      text: name,
    })),
    {
      fact: {
        kind: FactKind.Role,
        role: 'gateway',
      },
      text: 'role.gateway',
    },
    {
      fact: {
        kind: FactKind.Unknown,
        text: 'file.name',
      },
      text: 'file.name',
    },
  ])('should read $text as the fact it names', ({ fact, text }) => {
    // Act
    const read = Facts.of(text);

    // Assert
    expect(read).toStrictEqual(fact);
  });

  it.each<{
    fact: Fact;
    written: string;
  }>([
    {
      fact: {
        kind: FactKind.Named,
        name: FactName.PackageName,
      },
      written: '${package.name}',
    },
    {
      fact: {
        kind: FactKind.Role,
        role: 'gateway',
      },
      written: '${role.gateway}',
    },
    {
      fact: {
        kind: FactKind.Unknown,
        text: 'file.name',
      },
      written: '${file.name}',
    },
  ])('should write the reference to $written', ({ fact, written }) => {
    // Act
    const text = Facts.textOf(fact);

    // Assert
    expect(text).toBe(written);
  });

  it('should find every reference a text writes, and no text in braces that names no object and property', () => {
    // Arrange
    const text = '${constitution.path}/presets/${role.source}/x ${HOME} ${a.b-c_D}';

    // Act
    const references = Facts.referencesIn(text);

    // Assert
    expect(references).toStrictEqual([
      {
        fact: {
          kind: FactKind.Named,
          name: FactName.ConstitutionPath,
        },
        written: '${constitution.path}',
      },
      {
        fact: {
          kind: FactKind.Role,
          role: 'source',
        },
        written: '${role.source}',
      },
      {
        fact: {
          kind: FactKind.Unknown,
          text: 'a.b-c_D',
        },
        written: '${a.b-c_D}',
      },
    ]);
  });

  it.each([
    {
      condition: 'every fact is given',
      resolved: 'src/kit.ts',
      text: '${role.source}/${package.name}.ts',
    },
    {
      condition: 'one fact is not given',
      resolved: undefined,
      text: '${role.source}/${role.gone}.ts',
    },
  ])('should write the text with its facts when $condition', ({ resolved, text }) => {
    // Arrange
    const values = new Map([
      [
        'role.source',
        'src',
      ],
      [
        'package.name',
        'kit',
      ],
    ]);

    // Act
    const written = Facts.resolvedIn({
      text,
      valueOf: (fact) => values.get(Facts.textOf(fact).slice(2, -1)),
    });

    // Assert
    expect(written).toBe(resolved);
  });

  it.each([
    {
      condition: 'the text is the reference alone',
      text: '${file.isTop}',
      whole: {
        kind: FactKind.Named,
        name: FactName.FileIsTop,
      },
    },
    {
      condition: 'the text holds more than the reference',
      text: '!!${workspace.members}',
      whole: undefined,
    },
    {
      condition: 'the text holds no reference',
      text: 'isTop',
      whole: undefined,
    },
  ])('should give the fact a text names whole when $condition', ({ text, whole }) => {
    // Act
    const fact = Facts.wholeOf(text);

    // Assert
    expect(fact).toStrictEqual(whole);
  });

  it.each([
    {
      fact: Facts.of('file.isTop'),
      isTruth: true,
    },
    {
      fact: Facts.of('workspace.isRoot'),
      isTruth: true,
    },
    {
      fact: Facts.of('package.name'),
      isTruth: false,
    },
    {
      fact: Facts.of('role.isTop'),
      isTruth: false,
    },
  ])('should tell a truth from $fact.kind $fact.name', ({ fact, isTruth }) => {
    // Act
    const isBoolean = Facts.isBoolean(fact);

    // Assert
    expect(isBoolean).toBe(isTruth);
  });

  it.each([
    {
      fact: Facts.of('package.name'),
      isNamed: true,
    },
    {
      fact: Facts.of('constitution.path'),
      isNamed: false,
    },
    {
      fact: Facts.of('role.package'),
      isNamed: false,
    },
  ])('should tell the fact package.name from $fact.kind', ({ fact, isNamed }) => {
    // Act
    const isPackageName = Facts.isNamed(fact, FactName.PackageName);

    // Assert
    expect(isPackageName).toBe(isNamed);
  });
});
