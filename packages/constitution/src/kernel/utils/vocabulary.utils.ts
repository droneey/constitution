import { VOCABULARY_SECTION } from '../constants';
import { fencedLinesOf } from './code-fences.utils';
import { isHeading } from './sections.utils';

const SECTION = /^## (.+)/;

const vocabularyOf = (body: string): readonly string[] => {
  const lines = body.split('\n');
  const fenced = fencedLinesOf(lines);
  const definitions: string[] = [];
  let definition: string[] = [];
  let isInVocabulary = false;

  const close = (): void => {
    if (definition.length > 0) {
      definitions.push(definition.join('\n'));
      definition = [];
    }
  };

  for (const [index, line] of lines.entries()) {
    const isFenced = fenced[index] === true;

    if (!isFenced && isHeading(line)) {
      close();
      isInVocabulary = SECTION.exec(line)?.[1] === VOCABULARY_SECTION;
    } else if (isInVocabulary && !isFenced && line.trim() === '') {
      close();
    } else if (isInVocabulary) {
      definition.push(line);
    }
  }

  close();

  return definitions;
};

export { vocabularyOf };
