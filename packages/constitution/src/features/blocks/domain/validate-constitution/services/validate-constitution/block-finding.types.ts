import type {
  RequirementsTableDetails,
  RuleFormDetails,
  ValueFindingDetails,
} from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';

import type { LoadFindingDetails } from '../../../constitution/entities';
import type { ManifestReadDetails } from '../../../manifest/entities';
import type {
  AbstractBlocksDetails,
  BlockFormDetails,
  BudgetDetails,
  ConfigurationLanguagesDetails,
  CoreChaptersDetails,
  CorePartDetails,
  CyclesDetails,
  DecisionsDetails,
  FrontMatterDetails,
  HooksDetails,
  LinksDetails,
  MarketplaceDetails,
  PluginDetails,
  ReferencesDetails,
  RequirementsDetails,
  RequiresDetails,
  RulesDetails,
  SeamsDetails,
  TermsDetails,
} from './checks';

type BlockFindingDetails = AbstractBlocksDetails &
  BlockFormDetails &
  BudgetDetails &
  ConfigurationLanguagesDetails &
  CoreChaptersDetails &
  CorePartDetails &
  CyclesDetails &
  DecisionsDetails &
  FrontMatterDetails &
  HooksDetails &
  LinksDetails &
  LoadFindingDetails &
  ManifestReadDetails &
  MarketplaceDetails &
  PluginDetails &
  ReferencesDetails &
  RequirementsDetails &
  RequirementsTableDetails &
  RequiresDetails &
  RuleFormDetails &
  RulesDetails &
  SeamsDetails &
  TermsDetails &
  ValueFindingDetails;

type BlockFindingCode = keyof BlockFindingDetails & string;

type BlockFinding = FindingOf<BlockFindingDetails>;

export type { BlockFinding, BlockFindingCode, BlockFindingDetails };
