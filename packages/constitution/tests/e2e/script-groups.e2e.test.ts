import { describe, expect, it } from 'bun:test';

import { compareText } from '#/kernel/utils';

import {
  API,
  checkedUnits,
  scriptsOf,
  shellFilesOf,
  specsScripts,
  testsRun,
  WEB,
  workspace,
} from './script-groups.fixtures';

describe('the scripts the presets give a unit run by Bun', () => {
  it.each([
    {
      files: [
        'run.sh',
      ],
      unit: '',
    },
    {
      files: [
        'tool.sh',
      ],
      unit: WEB,
    },
  ])("should hand ShellCheck only the unit's own scripts in $unit", ({ files, unit }) => {
    // Act
    const listed = shellFilesOf(unit);

    // Assert
    expect(listed).toStrictEqual(files);
  });

  it.each([
    '',
    WEB,
  ])('should keep the scripts of the unit in $unit in their order as texts', (unit) => {
    // Act
    const names = Object.keys(scriptsOf(`${workspace()}/${unit}`));

    // Assert
    expect(names).toStrictEqual(names.toSorted(compareText));
  });

  it('should compose the check of a unit of only the groups and the gate it has', () => {
    // Act
    const checks = {
      specs: specsScripts()['check'],
      web: scriptsOf(`${workspace()}/${WEB}`)['check'],
    };

    // Assert
    expect(checks).toStrictEqual({
      specs: 'bun run --sequential test',
      web: "bun run --sequential 'check:*'",
    });
  });

  it('should give a member whose tools only the top unit runs no script, and run nothing there', () => {
    // Act
    const checked = checkedUnits();

    // Assert
    expect({
      checked,
      scripts: scriptsOf(`${workspace()}/${API}`),
    }).toStrictEqual({
      checked: [
        '',
        WEB,
      ],
      scripts: {},
    });
  });

  it('should fail the specs of a unit that holds source and no spec', () => {
    // Act
    const ran = testsRun({
      'src/add.ts': 'export const add = (left: number, right: number): number => left + right;\n',
    });

    // Assert
    expect(ran.exitCode).toBe(1);
  });
});
