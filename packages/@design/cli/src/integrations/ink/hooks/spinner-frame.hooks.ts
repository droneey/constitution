import { useAnimation } from 'ink';

import { useTheme } from '../theme';

const useSpinnerFrame = (): string | undefined => {
  const { isMotionReduced, spinner } = useTheme();
  const { frame } = useAnimation({
    interval: spinner.intervalMs,
    isActive: !isMotionReduced,
  });

  return isMotionReduced ? undefined : spinner.frames[frame % spinner.frames.length];
};

export { useSpinnerFrame };
