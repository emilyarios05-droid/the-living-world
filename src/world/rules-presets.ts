import type { RuleCategory } from './rules.js';

export interface RulePreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly rules: Partial<Record<RuleCategory, string>>;
}

export const WORLD_RULE_PRESETS: readonly RulePreset[] = [
  {
    id: 'grounded-fantasy', name: 'Grounded fantasy',
    description: 'Magic and non-human peoples exist, but everyday life, time, money and consequences remain grounded.',
    rules: {
      magic: 'Magic exists, is limited, and has a meaningful cost. It cannot casually override established reality.',
      species: 'Humans and several sapient fantasy peoples exist. Each species has its own biology, culture and lifespan.',
      economy: 'The world has a functioning currency, wages, businesses, trade, taxes and prices that change with supply and demand.',
      death: 'Death is permanent unless the world establishes a rare, rule-bound way to return.',
    },
  },
  {
    id: 'modern-realistic', name: 'Modern realistic',
    description: 'A contemporary world with realistic technology, institutions, health, money and social consequences.',
    rules: {
      physics: 'Physical laws follow a realistic modern world.',
      technology: 'Technology is approximately modern-day and must obey plausible physical limits.',
      medicine: 'Common illnesses, injuries and treatment follow realistic timelines and outcomes.',
      economy: 'Currency, wages, businesses, taxes, bills, prices and changing economic conditions function realistically.',
      transportation: 'Travel takes real simulated time using realistically available transportation.',
    },
  },
  {
    id: 'science-fiction', name: 'Science fiction',
    description: 'A technologically advanced world whose unusual technology still operates according to explicit rules.',
    rules: {
      technology: 'Advanced technology exists, including technologies selected during world creation, with explicit limitations and costs.',
      economy: 'Advanced technology changes labor, resources, trade and prices, but the world still has a functioning economy.',
      communication: 'Communication technology is advanced but still requires devices, access, accounts and network availability.',
    },
  },
];
