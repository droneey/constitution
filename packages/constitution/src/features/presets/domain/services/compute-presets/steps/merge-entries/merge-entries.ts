import { isDeepEqual } from '#/kernel/utils';

import type { MergeProblem, PresetsFinding } from '../../../../entities';
import { Candidate, MergedFile, PresetsCode, PresetValue } from '../../../../entities';
import type { ResolvedCandidate } from '../resolve-facts';
import { joinWords } from './steps/join-words';

type MergedCandidate = ResolvedCandidate & {
  readonly merged: MergedFile;
};

interface CandidatesMerged {
  readonly candidates: readonly MergedCandidate[];
  readonly findings: readonly PresetsFinding[];
}

interface MergeEntriesInput {
  readonly resolved: readonly ResolvedCandidate[];
}

const isInsertWithoutTarget = (problem: MergeProblem): boolean =>
  problem.code === PresetsCode.SlotInNoList || problem.code === PresetsCode.MissingSlot;

// Why: an insert lands in a list another entry gives; when an override or an axis drops that entry,
// the insert has nowhere to land and is skipped, as a file that receives only inserts is.
const withoutProblemsOfInsertsIntoDropped = (
  candidate: ResolvedCandidate,
  written: MergedFile,
): MergedFile => {
  // Stryker disable next-line ConditionalExpression,BlockStatement: with nothing dropped the second merge finds the same problems; the return only spares it
  if (candidate.droppedContributions.length === 0) {
    return written;
  }

  const { problems } = MergedFile.merge([
    ...candidate.contributions,
    ...candidate.droppedContributions,
  ]);

  return {
    ...written,
    problems: written.problems.filter(
      (problem) =>
        !isInsertWithoutTarget(problem) || problems.some((kept) => isDeepEqual(kept, problem)),
    ),
  };
};

const mergeEntries = (input: MergeEntriesInput): CandidatesMerged => {
  const candidates = input.resolved.flatMap((candidate): readonly MergedCandidate[] => {
    if (
      candidate.contributions.every((contribution) => PresetValue.isInsertOnly(contribution.value))
    ) {
      return [];
    }

    const written = withoutProblemsOfInsertsIntoDropped(
      candidate,
      MergedFile.merge(candidate.contributions),
    );

    return [
      {
        ...candidate,
        merged:
          written.value === undefined
            ? written
            : {
                ...written,
                value: joinWords({
                  contributions: candidate.contributions,
                  merged: written.value,
                }),
              },
      },
    ];
  });

  return {
    candidates,
    findings: candidates.flatMap((candidate) =>
      candidate.merged.problems.map((problem) => ({
        ...problem,
        path: Candidate.pathOf(candidate),
      })),
    ),
  };
};

export type { CandidatesMerged, MergedCandidate, MergeEntriesInput };
export { mergeEntries };
