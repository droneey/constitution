import type { ThemeModeReader } from '../domain/contracts';
import type { ThemeModeFiles } from '../domain/entities';

const createFakeThemeModeReader = (modes: readonly ThemeModeFiles[]): ThemeModeReader => ({
  read: (): readonly ThemeModeFiles[] => modes,
});

export { createFakeThemeModeReader };
