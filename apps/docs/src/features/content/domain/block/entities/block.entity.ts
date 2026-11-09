import type { ChapterListGaps } from '../../source/errors';
import { SourceError, SourceFailure } from '../../source/errors';

enum Axis {
  Foundation = 'foundation',
  Architecture = 'architecture',
  Workflow = 'workflow',
}

enum BlockLayer {
  Core = 'core',
  Domain = 'domains',
  Platform = 'contexts/platforms',
  Language = 'contexts/languages',
  Implementation = 'implementations',
}

const axes: readonly Axis[] = Object.values(Axis);

const AXIS_MARK = '@';

const axisOfFolder = (folderName: string | undefined): Axis | undefined =>
  axes.find((axis) => folderName === `${AXIS_MARK}${axis}`);

const axisFoldersAmong = (names: readonly string[]): readonly string[] =>
  axes.flatMap((axis) => names.filter((name) => axisOfFolder(name) === axis));

interface ChapterListInput {
  readonly chapters: readonly string[];
  readonly listed: readonly string[];
}

/** @throws {SourceError} when the list leaves out, repeats or invents a chapter */
const listedChaptersOf = (input: ChapterListInput): readonly string[] => {
  const gaps: ChapterListGaps = {
    missing: input.chapters.filter((chapter) => !input.listed.includes(chapter)),
    repeated: [
      ...new Set(input.listed.filter((entry, index) => input.listed.indexOf(entry) !== index)),
    ],
    unknown: input.listed.filter((entry) => !input.chapters.includes(entry)),
  };

  if (gaps.missing.length > 0 || gaps.repeated.length > 0 || gaps.unknown.length > 0) {
    throw new SourceError({
      code: SourceFailure.ChapterListMismatch,
      details: gaps,
    });
  }

  return input.listed;
};

export { Axis, axisFoldersAmong, axisOfFolder, BlockLayer, listedChaptersOf };
