import type { Rule } from '../models';
import { assembliesRule } from './assemblies.rule';
import { budgetRule } from './budget.rule';
import { decisionsRule } from './decisions.rule';
import { kindDirectionRule } from './kind-direction.rule';
import { linksRule } from './links.rule';
import { manifestsRule } from './manifests.rule';
import { referencesRule } from './references.rule';

const RULES: readonly Rule[] = [
  manifestsRule,
  assembliesRule,
  kindDirectionRule,
  budgetRule,
  linksRule,
  referencesRule,
  decisionsRule,
];

export { RULES };
