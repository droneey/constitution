import { StrictMode } from 'react';

import { StartClient } from '@tanstack/react-start/client';

import { hydrateRoot } from 'react-dom/client';

import { keepOneLayout } from '#/libs/ui';

keepOneLayout();

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
);
