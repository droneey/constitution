import type { PresetsFinding } from '../../../../../entities';
import { MergedFile, PresetValue } from '../../../../../entities';
import { joinWords } from '../join-words';
import type { ResolvedCandidate } from '../resolve-facts';
import { candidatePathOf } from '../select-entries';

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

/**
 * A candidate whose entries only insert into lists no entry of it places is not written: its
 * lists' owner is not in force there.
 */
const mergeEntries = (input: MergeEntriesInput): CandidatesMerged => {
  const candidates = input.resolved.flatMap((candidate): readonly MergedCandidate[] => {
    if (
      candidate.contributions.every((contribution) => PresetValue.isInsertOnly(contribution.value))
    ) {
      return [];
    }

    const written = MergedFile.merge(candidate.contributions);

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
        path: candidatePathOf(candidate),
      })),
    ),
  };
};

export type { CandidatesMerged, MergedCandidate, MergeEntriesInput };
export { mergeEntries };
