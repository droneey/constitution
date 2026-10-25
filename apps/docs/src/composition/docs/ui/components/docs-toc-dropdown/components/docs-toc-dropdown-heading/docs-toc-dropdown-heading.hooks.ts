import { useState } from 'react';

import { RollDirection } from './docs-toc-dropdown-heading.constants';

function useRollDirection(position: number): RollDirection {
  const [shown, setShown] = useState({
    position,
    roll: RollDirection.FromBelow,
  });

  if (shown.position !== position) {
    setShown({
      position,
      roll: Math.sign(position - shown.position),
    });
  }

  return shown.roll;
}

export { useRollDirection };
