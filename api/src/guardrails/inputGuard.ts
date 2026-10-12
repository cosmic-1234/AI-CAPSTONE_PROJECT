import { getHardeningConfig } from '../config.js';

export interface InputGuardResult {
  maskedInput: string;
  isInjection: boolean;
  isDistress: boolean;
  isOffTopic: boolean;
  guardsFired: string[];
  refusalMessage?: string;
}

// Regex patterns for Indian PII identifiers
const PII_PATTERNS = [
  { name: 'Aadhaar', regex: /\b[2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, replacement: '[REDACTED-AADHAAR]' },
  { name: 'PAN', regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, replacement: '[REDACTED-PAN]' },
  { name: 'Phone', regex: /(\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g, replacement: '[REDACTED-PHONE]' },
  { name: 'BankAccount', regex: /\b\d{9,18}\b/g, replacement: '[REDACTED-BANK-ACC]' },
];

// Patterns indicative of prompt injection, jailbreaks, or instruction overrides
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /disregard\s+(the\s+)?(system|above|guidelines)/i,
  /you\s+are\s+now\s+(unrestricted|in\s+developer\s+mode|dan|an\s+admin)/i,
  /reveal\s+(your\s+)?(hidden|system\s+prompt|secret\s+instructions)/i,
  /override\s+(policy|safety|guardrails)/i,
  /<\s*(system|prompt|instruction|script)\s*>/i,
  /\b(sudo|admin_override|disable_checks)\b/i,
];

// Distress and emergency keywords
const DISTRESS_PATTERNS = [
  /\b(suicide|kill\s+myself|end\s+my\s+life|want\s+to\s+die|no\s+reason\s+to\s+live)\b/i,
  /\b(starving|cannot\s+afford\s+food|homeless|bereavement|emergency\s+medical)\b/i,
  /\b(extreme\s+depression|panic\s+attack|mental\s+breakdown)\b/i,
];

// Off-topic keywords unrelated to financial aid, fees, scholarships, or loans
const OFF_TOPIC_PATTERNS = [
  /\b(write\s+python|solve\s+math|cricket\s+score|movie\s+recommendation|recipe\s+for)\b/i,
  /\b(political\s+party|election\s+prediction|essay\s+on|code\s+in\s+c\+\+)\b/i,
];

export function runInputGuards(rawInput: string): InputGuardResult {
  const hardening = getHardeningConfig().hardening;
  const guardsFired: string[] = [];
  let maskedInput = rawInput;

  // 1. PII Masking Guard (F3)
  if (hardening.pii_masking_guard) {
    let piiDetected = false;
    for (const pattern of PII_PATTERNS) {
      if (pattern.regex.test(maskedInput)) {
        piiDetected = true;
        maskedInput = maskedInput.replace(pattern.regex, pattern.replacement);
      }
    }
    if (piiDetected) {
      guardsFired.push('pii_masking_guard');
    }
  }

  // 2. Prompt Injection Guard (F2)
  let isInjection = false;
  if (hardening.input_injection_guard) {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(rawInput)) {
        isInjection = true;
        guardsFired.push('input_injection_guard');
        break;
      }
    }
    if (isInjection) {
      return {
        maskedInput,
        isInjection: true,
        isDistress: false,
        isOffTopic: false,
        guardsFired,
        refusalMessage: 'Security Guard Triggered: Unauthorized instruction override attempt detected. This request has been safely blocked and logged.',
      };
    }
  }

  // 3. Distress Detection Guard (F8)
  let isDistress = false;
  if (hardening.distress_router_guard) {
    for (const pattern of DISTRESS_PATTERNS) {
      if (pattern.test(rawInput)) {
        isDistress = true;
        guardsFired.push('distress_router_guard');
        break;
      }
    }
  }

  // 4. Off-Topic Guard (F9)
  let isOffTopic = false;
  if (hardening.off_topic_guard && !isDistress) {
    for (const pattern of OFF_TOPIC_PATTERNS) {
      if (pattern.test(rawInput)) {
        isOffTopic = true;
        guardsFired.push('off_topic_guard');
        break;
      }
    }
    if (isOffTopic) {
      return {
        maskedInput,
        isInjection: false,
        isDistress: false,
        isOffTopic: true,
        guardsFired,
        refusalMessage: 'Sahayata is dedicated exclusively to financial aid, scholarships, fee waivers, and education loans at IIM Bodh Gaya. Your query appears outside the scope of student financial services.',
      };
    }
  }

  return {
    maskedInput,
    isInjection: false,
    isDistress,
    isOffTopic: false,
    guardsFired,
  };
}
