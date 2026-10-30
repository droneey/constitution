import type { TextsOf } from '#/shared/cli';

import type { DecisionsDetails } from '../../domain/validate-constitution/services';
import { DecisionsCode } from '../../domain/validate-constitution/services';

const DECISION_NUMBER_WIDTH = 4;

const decisionOf = (entry: number): string =>
  `ADR-${String(entry).padStart(DECISION_NUMBER_WIDTH, '0')}`;

const decisionsTexts: TextsOf<DecisionsDetails> = {
  [DecisionsCode.LogMissing]: () =>
    'is missing; the Constitution keeps its decision log at the root',
  [DecisionsCode.OutOfOrder]: ({ entry, previous }) =>
    `entry ${decisionOf(entry)} follows ${decisionOf(previous)}; the numbers of the log only rise`,
  [DecisionsCode.WithoutDateLine]: ({ entry }) =>
    `entry ${decisionOf(entry)} has no line "**Date:** YYYY-MM-DD · **Status:** Accepted|Proposed|Superseded by ADR-NNNN" under its heading`,
  [DecisionsCode.NotCalendarDate]: ({ date, entry }) =>
    `entry ${decisionOf(entry)} is dated ${date}, which is not a calendar date`,
};

export { decisionsTexts };
