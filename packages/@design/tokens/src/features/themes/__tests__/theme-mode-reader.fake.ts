import type { ThemeModeReader } from '../domain/contracts';
import type { ThemeModeFiles } from '../domain/entities';

/** a reader whose tokens hold `modes` */
const createFakeThemeModeReader = (modes: readonly ThemeModeFiles[]): ThemeModeReader => ({
  read: (): readonly ThemeModeFiles[] => modes,
});

export { createFakeThemeModeReader };
