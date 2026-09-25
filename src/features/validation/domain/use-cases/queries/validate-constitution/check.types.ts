import type { Constitution } from '#/features/constitution';
import type { Finding } from '#/kernel';

type Check = (constitution: Constitution) => readonly Finding[];

export type { Check };
