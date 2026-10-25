import { Met } from '#/kernel/entities';
import type { TextsOf } from '#/shared/cli';

import type {
  BudgetDetails,
  DecisionsDetails,
  LinksDetails,
  ReferencesDetails,
  RequirementsDetails,
  RulesDetails,
  TermsDetails,
} from '../../domain/use-cases/queries/check';
import {
  BudgetCode,
  DecisionsCode,
  LinksCode,
  ReferencesCode,
  RequirementsCode,
  RulesCode,
  TermsCode,
} from '../../domain/use-cases/queries/check';

const UNTITLED = 'untitled';
const DECISION_NUMBER_WIDTH = 4;

/** a decision as the log heads it, such as ADR-0007 */
const decisionOf = (entry: number): string =>
  `ADR-${String(entry).padStart(DECISION_NUMBER_WIDTH, '0')}`;

const rulesTexts: TextsOf<
  BudgetDetails &
    DecisionsDetails &
    LinksDetails &
    ReferencesDetails &
    RequirementsDetails &
    RulesDetails &
    TermsDetails
> = {
  [RulesCode.SlugOpensWithNo]: ({ slug }) =>
    `rule "${slug}" opens with "no-"; a slug says what holds`,
  [RulesCode.WithoutStatement]: ({ slug }) => `rule "${slug}" has no statement`,
  [RulesCode.WithoutWhy]: ({ slug }) => `rule "${slug}" has no Why`,
  [RulesCode.TagNotLens]: ({ slug, tag }) =>
    `rule "${slug}" has the tag "${tag}", which is not a lens`,
  [RulesCode.DefinedTwice]: ({ firstFile, slug }) =>
    `rule "${slug}" is also defined in ${firstFile}`,
  [RulesCode.ParentNotRule]: ({ parent, slug }) =>
    `rule "${slug}" carries out "${parent}", which is not a rule`,
  [RulesCode.ParentChainCycle]: ({ cycle, slug }) =>
    `rule "${slug}" carries out a chain that comes back to it: ${cycle.join(' → ')}`,
  [RulesCode.ParentInOwnBlock]: ({ parent, slug }) =>
    `rule "${slug}" carries out "${parent}", a rule of its own block; a rule carries out only a rule of another block`,
  [RulesCode.ParentOutOfReach]: ({ parent, parentBlock, slug }) =>
    `rule "${slug}" carries out "${parent}" of ${parentBlock}, which its block may not refer to`,
  [RulesCode.ParentSeamOutOfReach]: ({ parent, parentBlock, parentSeam, slug }) =>
    `rule "${slug}" carries out "${parent}" of ${parentBlock} with ${parentSeam}, which its place does not reach`,
  [RulesCode.ParentOffAxis]: ({ axis, parent, parentAxis, slug }) =>
    `rule "${slug}" carries out "${parent}" on ${parentAxis}, which a rule on ${axis} may not refer to`,
  [RulesCode.LooserThanParent]: ({ level, parent, parentLevel, slug }) =>
    `rule "${slug}" is ${level} while it carries out the ${parentLevel} rule "${parent}"; a rule is never looser than the rule it carries out`,
  [RulesCode.WithoutLevel]: ({ parent, slug }) =>
    `rule "${slug}" carries out "${parent}" without a level; a rule that carries out another states its own, never looser than it`,
  [RulesCode.OutsideParentChapter]: ({ chapter, parent, parentChapter, slug }) =>
    `rule "${slug}" sits in the chapter "${chapter ?? UNTITLED}" while it carries out "${parent}" of core's chapter "${parentChapter ?? UNTITLED}"; a rule of a language or a platform that tightens core sits in the chapter titled like its parent's`,
  [TermsCode.Misshapen]: ({ written }) =>
    `sets "${written}" in bold, which is neither plain words nor one code span; bold defines a term`,
  [TermsCode.DefinedTwice]: ({ firstBlock, firstFile, term }) =>
    `defines "${term}", which ${firstFile} of ${firstBlock} defines already; a term is defined once`,
  [TermsCode.OffAxis]: ({ axis, term, termAxis }) =>
    `uses "${term}", a term of the ${termAxis}; ${axis} holds whatever the ${termAxis}`,
  [TermsCode.OutOfReach]: ({ owner, term }) =>
    `uses "${term}", which ${owner} defines; only ${owner} and the blocks that build on it may`,
  [TermsCode.Misspelled]: ({ kind, owner, term, written }) =>
    `writes \`${written}\`, which ${owner} defines as \`${term}\`; a ${kind} keeps one spelling`,
  [RequirementsCode.OutsideImplementation]: () =>
    'answers requirements, which only an implementation does',
  [RequirementsCode.OutsidePassport]: () =>
    "answers requirements outside the block's passport; an implementation answers them in its passport <id>.md",
  [RequirementsCode.NotRule]: ({ requirement }) => `answers "${requirement}", which is not a rule`,
  [RequirementsCode.OwnRule]: ({ requirement }) =>
    `answers "${requirement}", a rule of its own block; a Requirements table answers the blocks above`,
  [RequirementsCode.OutOfReach]: ({ owner, requirement }) =>
    `answers "${requirement}" of ${owner}, which its block may not refer to`,
  [RequirementsCode.MetUnknown]: ({ met, requirement }) =>
    `answers "${requirement}" with Met "${met}"; Met is ${Met.Yes}, ${Met.Partly} or ${Met.No}`,
  [RequirementsCode.WithoutHow]: ({ requirement }) => `answers "${requirement}" without saying how`,
  [RequirementsCode.WithoutCover]: ({ met, requirement }) =>
    `answers "${requirement}" ${met} without naming the rule that covers the rest`,
  [RequirementsCode.Repeated]: ({ requirement }) => `answers "${requirement}" twice`,
  [DecisionsCode.LogMissing]: () =>
    'is missing; the Constitution keeps its decision log at the root',
  [DecisionsCode.OutOfOrder]: ({ entry, previous }) =>
    `entry ${decisionOf(entry)} follows ${decisionOf(previous)}; the numbers of the log only rise`,
  [DecisionsCode.WithoutDateLine]: ({ entry }) =>
    `entry ${decisionOf(entry)} has no line "**Date:** YYYY-MM-DD · **Status:** Accepted|Proposed" under its heading`,
  [DecisionsCode.NotCalendarDate]: ({ date, entry }) =>
    `entry ${decisionOf(entry)} is dated ${date}, which is not a calendar date`,
  [ReferencesCode.LinkIntoOtherBlock]: ({ owner, target }) =>
    `links to ${target}, a file of the block ${owner}; a block refers to another only through its front matter and with/ file names`,
  [ReferencesCode.NamesOtherRule]: ({ owner, slug }) =>
    `names the rule ${slug} of ${owner}; a rule refers to another only as the parent in its heading`,
  [ReferencesCode.CitesDecision]: ({ decision }) =>
    `cites ${decision}; a block states its rules without citing the decision log`,
  [LinksCode.MissingTarget]: ({ target }) => `links to a missing file "${target}"`,
  [BudgetCode.FileOverBudget]: ({ budget, lines }) =>
    `has ${lines} lines; a file holds at most ${budget}, and a longer block splits into chapters`,
};

export { rulesTexts };
