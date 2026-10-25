import { useAnimation } from 'ink';

import { useTheme } from './theme.hooks';

/** every spinner shares Ink's one timer */
const useSpinnerFrame = (): string | undefined => {
  const { isMotionReduced, spinner } = useTheme();
  // Stryker disable next-line ObjectLiteral: the default theme's pace, 100 ms, is Ink's own default, so a call without it draws alike
  const { frame } = useAnimation({
    interval: spinner.intervalMs,
    isActive: !isMotionReduced,
  });

  return isMotionReduced ? undefined : spinner.frames[frame % spinner.frames.length];
};

export { useSpinnerFrame };
