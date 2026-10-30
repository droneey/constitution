import type { ThemeModeReader } from '../application/contracts';
import type { ThemeModeFiles } from '../domain/theme-mode/entities';

const createFakeThemeModeReader = (modes: readonly ThemeModeFiles[]): ThemeModeReader => ({
  read: (): readonly ThemeModeFiles[] => modes,
});

export { createFakeThemeModeReader };
