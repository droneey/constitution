'use client';
import { useEffect } from 'react';

import type { GlideLists } from './glide.types';
import { glideAll } from './glide-all';

/**
 * slides a muted block under the row under the pointer or the keyboard, in each of `lists`, which
 * must be a module constant, since a new object sets the lists up again; the page whose lists it
 * serves calls it, once they are hydrated, since React hydrates no element it did not render
 */
export function useGlide(lists: GlideLists): void {
  useEffect(
    () => glideAll(lists),
    // Stryker disable next-line ArrayDeclaration: a page passes lists that never change, so any dependencies that never change run it once
    [
      lists,
    ],
  );
}
