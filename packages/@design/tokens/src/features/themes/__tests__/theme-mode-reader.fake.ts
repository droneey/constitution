import type { ThemeModeReader } from '../application/contracts';
import type { ThemeModeFiles } from '../domain/entities';

const createFakeThemeModeReader = (modes: readonly ThemeModeFiles[]): ThemeModeReader => ({
  read: (): readonly ThemeModeFiles[] => modes,
});

export { createFakeThemeModeReader };
