import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'api', '.env') });

// Find the project root whether run from repo root or api/ directory
function resolveRootDir(): string {
  if (fs.existsSync(path.join(process.cwd(), 'config'))) {
    return process.cwd();
  }
  if (fs.existsSync(path.join(process.cwd(), '..', 'config'))) {
    return path.resolve(process.cwd(), '..');
  }
  return process.cwd();
}

const ROOT_DIR = resolveRootDir();
const CONFIG_DIR = path.join(ROOT_DIR, 'config');

function readYamlSafe<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, 'utf8');
      return yaml.parse(file) as T;
    }
  } catch (err) {
    console.error(`[Config] Failed to load ${filePath}:`, err);
  }
  return fallback;
}

export interface BrandConfig {
  institute: {
    name: string;
    short_name: string;
    portal_name: string;
    tagline: string;
    logo_path: string;
    leaf_icon_path: string;
    accent_color: string;
    bg_color: string;
  };
  offices: Record<string, {
    name: string;
    email: string;
    phone: string;
    location: string;
  }>;
  programmes: Array<{
    code: string;
    name: string;
    duration_years: number;
  }>;
  batches: string[];
  calendar: {
    academic_year: string;
    deadlines: Array<{
      id: string;
      scheme: string;
      deadline_date: string;
      description: string;
    }>;
  };
}

export interface HardeningConfig {
  hardening: {
    enforce_current_policy_only: boolean;
    input_injection_guard: boolean;
    pii_masking_guard: boolean;
    retrieval_acl_enforcement: boolean;
    output_grounding_guard: boolean;
    prohibit_unauthorized_commitments: boolean;
    tone_guard: boolean;
    distress_router_guard: boolean;
    off_topic_guard: boolean;
    require_human_approval_for_actions: boolean;
    tool_allowlist_guard: boolean;
    enforce_loop_limits: boolean;
    max_agent_steps: number;
    max_tool_calls_per_session: number;
    enforce_retrieval_threshold: boolean;
    min_relevance_threshold: number;
    idempotency_enforcement: boolean;
    document_cross_verification: boolean;
  };
}

export interface PricingConfig {
  currency: string;
  usd_to_inr: number;
  models: Record<string, {
    provider: string;
    input_cost_per_million_usd?: number;
    output_cost_per_million_usd?: number;
    input_cost_per_thousand_inr: number;
    output_cost_per_thousand_inr: number;
  }>;
  default_model: string;
}

export interface SchemesConfig {
  schemes: Array<{
    id: string;
    name: string;
    short_code: string;
    category: string;
    coverage: string;
    criteria: {
      max_family_income_inr: number | null;
      min_cgpa: number | null;
      programmes?: string[];
      allowed_categories?: string[];
      top_percentile?: number;
      sudden_distress_event?: boolean;
    };
    required_documents: string[];
    citation: string;
  }>;
}

export const brandConfig = readYamlSafe<BrandConfig>(
  path.join(CONFIG_DIR, 'brand.yaml'),
  {
    institute: {
      name: 'Indian Institute of Management Bodh Gaya',
      short_name: 'IIM Bodh Gaya',
      portal_name: 'Sahayata – Financial Aid Desk',
      tagline: 'Student Financial Assistance & Scholarship Portal',
      logo_path: '/brand/logo.svg',
      leaf_icon_path: '/brand/leaf.svg',
      accent_color: '#9C2720',
      bg_color: '#ffffff',
    },
    offices: {},
    programmes: [],
    batches: [],
    calendar: { academic_year: '2026-27', deadlines: [] },
  }
);

export function getHardeningConfig(): HardeningConfig {
  return readYamlSafe<HardeningConfig>(
    path.join(CONFIG_DIR, 'hardening.yaml'),
    {
      hardening: {
        enforce_current_policy_only: true,
        input_injection_guard: true,
        pii_masking_guard: true,
        retrieval_acl_enforcement: true,
        output_grounding_guard: true,
        prohibit_unauthorized_commitments: true,
        tone_guard: true,
        distress_router_guard: true,
        off_topic_guard: true,
        require_human_approval_for_actions: true,
        tool_allowlist_guard: true,
        enforce_loop_limits: true,
        max_agent_steps: 6,
        max_tool_calls_per_session: 3,
        enforce_retrieval_threshold: true,
        min_relevance_threshold: 0.35,
        idempotency_enforcement: true,
        document_cross_verification: true,
      },
    }
  );
}

export function updateHardeningConfig(updates: Partial<HardeningConfig['hardening']>): HardeningConfig {
  const current = getHardeningConfig();
  current.hardening = { ...current.hardening, ...updates };
  const yamlStr = yaml.stringify(current);
  fs.writeFileSync(path.join(CONFIG_DIR, 'hardening.yaml'), yamlStr, 'utf8');
  return current;
}

export const pricingConfig = readYamlSafe<PricingConfig>(
  path.join(CONFIG_DIR, 'pricing.yaml'),
  {
    currency: 'INR',
    usd_to_inr: 86.5,
    models: {},
    default_model: 'gemini-1.5-flash',
  }
);

export const schemesConfig = readYamlSafe<SchemesConfig>(
  path.join(CONFIG_DIR, 'schemes.yaml'),
  { schemes: [] }
);

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: process.env.API_URL || 'http://localhost:4000',
  WEB_URL: process.env.WEB_URL || 'http://localhost:3000',
  LLM_MODE: (process.env.LLM_MODE || 'mock') as 'mock' | 'cached' | 'live',
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || 'local',
  DATABASE_PATH: process.env.DATABASE_PATH || path.join(ROOT_DIR, 'sahayata.db'),
  ROOT_DIR,
  KNOWLEDGE_BASE_DIR: path.join(ROOT_DIR, 'knowledge_base'),
  DATA_DIR: path.join(ROOT_DIR, 'data'),
  TESTS_DIR: path.join(ROOT_DIR, 'tests'),
  REPORTS_DIR: path.join(ROOT_DIR, 'reports'),
};
