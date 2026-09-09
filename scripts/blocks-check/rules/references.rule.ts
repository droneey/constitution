import type { Block, Chapter, Constitution, Finding, Rule } from '../models';
import { kindOfBlockId, kindRank } from '../models';

const FENCED_CODE = /```[\s\S]*?```/g;
const BLOCK_PATH =
  /\b(?:languages|concerns|spheres|frameworks|stacks)\/[a-z0-9-]+/g;

const prose = (text: string): string => text.replace(FENCED_CODE, '');

const namesLowerBlock = (block: Block, chapter: Chapter): readonly Finding[] =>
  [
    ...new Set(prose(chapter.text).match(BLOCK_PATH) ?? []),
  ].flatMap((id) => {
    const kind = kindOfBlockId(id);

    if (kind === undefined || kindRank(kind) <= kindRank(block.kind)) {
      return [];
    }

    return [
      {
        message: `names "${id}", a ${kind} block, in prose; a ${block.kind} chapter names lower blocks only in manifests`,
        path: chapter.path,
      },
    ];
  });

const referencesRule: Rule = ({ blocks }: Constitution): readonly Finding[] =>
  blocks.flatMap((block) =>
    block.chapters.flatMap((chapter) => namesLowerBlock(block, chapter)),
  );

export { referencesRule };
