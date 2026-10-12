import { getHardeningConfig } from '../config.js';
import { RetrievedChunk } from '../rag/retriever.js';

export interface OutputGuardResult {
  guardedOutput: string;
  guardsFired: string[];
  isGrounded: boolean;
  hasUnauthorizedCommitment: boolean;
}

// Patterns that constitute unauthorized commitments
const COMMITMENT_PATTERNS = [
  /\b(you\s+(are|have\s+been)\s+approved)\b/i,
  /\b(we\s+have\s+approved\s+your\s+(scholarship|fee\s+waiver|grant))\b/i,
  /\b(you\s+will\s+(definitely\s+)?receive\s+(inr|rs\.?|₹)?\s*[\d,]+)\b/i,
  /\b(guaranteed\s+(approval|disbursement|waiver))\b/i,
  /\b(your\s+funds\s+have\s+been\s+disbursed)\b/i,
];

// Harsh or abrasive tone phrases that fail empathy guidelines
const HARSH_TONE_PATTERNS = [
  /\b(you\s+are\s+flatly\s+rejected)\b/i,
  /\b(do\s+not\s+bother\s+applying)\b/i,
  /\b(your\s+income\s+is\s+too\s+(high|bad))\b/i,
  /\b(ineligible\s+and\s+dismissed)\b/i,
];

export function runOutputGuards(
  rawOutput: string,
  retrievedChunks: RetrievedChunk[],
  isHumanAuthorizedDecision = false
): OutputGuardResult {
  const hardening = getHardeningConfig().hardening;
  const guardsFired: string[] = [];
  let guardedOutput = rawOutput;
  let hasUnauthorizedCommitment = false;
  let isGrounded = true;

  // 1. Unauthorized Commitments Guard (F6)
  if (hardening.prohibit_unauthorized_commitments && !isHumanAuthorizedDecision) {
    for (const pattern of COMMITMENT_PATTERNS) {
      if (pattern.test(guardedOutput)) {
        hasUnauthorizedCommitment = true;
        guardsFired.push('prohibit_unauthorized_commitments');
        // Neutralize commitment to an advisory recommendation
        guardedOutput = guardedOutput.replace(pattern, 'your application may be recommended for consideration');
      }
    }
    if (hasUnauthorizedCommitment) {
      guardedOutput += '\n\n*Institutional Notice: The AI assistant does not possess authority to grant, approve, or disburse financial aid. All final decisions require explicit review and approval by the Financial Aid Committee.*';
    }
  }

  // 2. Grounding Check Guard (F5)
  if (hardening.output_grounding_guard) {
    const hasCitations = /§[\d\.]+|citation/i.test(guardedOutput) || retrievedChunks.length > 0;
    if (!hasCitations && retrievedChunks.length === 0) {
      isGrounded = false;
      guardsFired.push('output_grounding_guard');
      guardedOutput += '\n\n*[Grounding Guard]: This response could not be verified against official indexed policy documents.*';
    }
  }

  // 3. Empathy & Tone Guard (F7)
  if (hardening.tone_guard) {
    let toneIssue = false;
    for (const pattern of HARSH_TONE_PATTERNS) {
      if (pattern.test(guardedOutput)) {
        toneIssue = true;
        guardsFired.push('tone_guard');
        guardedOutput = guardedOutput.replace(pattern, 'the profile does not currently satisfy the stated criteria');
      }
    }
    if (toneIssue) {
      guardedOutput += '\n\n*If you believe there are extenuating circumstances or errors in records, you may submit a formal appeal to the Financial Aid Committee or consult the Student Wellbeing Cell.*';
    }
  }

  return {
    guardedOutput,
    guardsFired,
    isGrounded,
    hasUnauthorizedCommitment,
  };
}
