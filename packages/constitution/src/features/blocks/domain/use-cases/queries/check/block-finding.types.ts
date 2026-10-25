import type {
  RequirementsTableDetails,
  RuleFormDetails,
  ValueFindingDetails,
} from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';

import type {
  AbstractBlocksDetails,
  BindingsDetails,
  BlockFormDetails,
  BudgetDetails,
  ConfigurationLanguagesDetails,
  CoreChaptersDetails,
  CorePartDetails,
  CyclesDetails,
  DecisionsDetails,
  FrontMatterDetails,
  LinksDetails,
  PluginDetails,
  PresetsDetails,
  ReferencesDetails,
  RequirementsDetails,
  RequiresDetails,
  RulesDetails,
  SeamsDetails,
  TemplatesDetails,
  TermsDetails,
} from './checks';
import type { LoadFindingDetails } from './steps/load-constitution';

/** What each code of the blocks' findings names. */
type BlockFindingDetails = AbstractBlocksDetails &
  BindingsDetails &
  BlockFormDetails &
  BudgetDetails &
  ConfigurationLanguagesDetails &
  CoreChaptersDetails &
  CorePartDetails &
  CyclesDetails &
  DecisionsDetails &
  FrontMatterDetails &
  LinksDetails &
  LoadFindingDetails &
  PluginDetails &
  PresetsDetails &
  ReferencesDetails &
  RequirementsDetails &
  RequirementsTableDetails &
  RequiresDetails &
  RuleFormDetails &
  RulesDetails &
  SeamsDetails &
  TemplatesDetails &
  TermsDetails &
  ValueFindingDetails;

type BlockFindingCode = keyof BlockFindingDetails & string;

type BlockFinding = FindingOf<BlockFindingDetails>;

export type { BlockFinding, BlockFindingCode, BlockFindingDetails };
