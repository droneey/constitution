import { atLineMessage, atLinesMessage } from './at-lines.messages';
import { LIST_SEPARATOR } from './list-separator.messages';

const atLinesText = (lines: readonly number[] | undefined): string => {
  if (lines === undefined || lines.length === 0) {
    return '';
  }

  const named = lines.map(String).join(LIST_SEPARATOR);

  return lines.length === 1 ? atLineMessage(named) : atLinesMessage(named);
};

export { atLinesText };
