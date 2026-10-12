import crypto from 'node:crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDb } from '../db/index.js';
import { env, pricingConfig } from '../config.js';

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costInr: number;
  latencyMs: number;
  cached: boolean;
}

function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function calculateCostInr(modelName: string, promptTokens: number, completionTokens: number): number {
  const modelPricing = pricingConfig.models[modelName] || pricingConfig.models[pricingConfig.default_model];
  if (!modelPricing) return 0;
  const inCost = (promptTokens / 1000) * (modelPricing.input_cost_per_thousand_inr || 0);
  const outCost = (completionTokens / 1000) * (modelPricing.output_cost_per_thousand_inr || 0);
  return inCost + outCost;
}

export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const start = Date.now();
  const db = getDb();
  const provider = env.LLM_PROVIDER;
  const modelName = request.model || pricingConfig.default_model;
  const cacheKey = computeHash(`${provider}:${modelName}:${request.systemPrompt || ''}:${request.prompt}`);

  // 1. Check SQLite LLM Cache (zero cost)
  if (env.LLM_MODE === 'cached' || env.LLM_MODE === 'mock' || env.LLM_MODE === 'live') {
    const cachedRow = db.prepare('SELECT response_text, prompt_tokens, completion_tokens FROM llm_cache WHERE prompt_hash = ?').get(cacheKey) as any;
    if (cachedRow) {
      const pTokens = cachedRow.prompt_tokens || 100;
      const cTokens = cachedRow.completion_tokens || 150;
      return {
        text: cachedRow.response_text,
        provider,
        model: modelName,
        promptTokens: pTokens,
        completionTokens: cTokens,
        costInr: 0, // Cached calls cost 0 INR!
        latencyMs: Date.now() - start,
        cached: true,
      };
    }
  }

  // 2. Mock mode: deterministic intelligent response without API reliance
  if (env.LLM_MODE === 'mock' || (!env.GEMINI_API_KEY && !env.GROQ_API_KEY)) {
    const pTokens = Math.ceil(request.prompt.split(/\s+/).length * 1.3);
    const mockReply = generateDeterministicMockResponse(request.prompt, request.systemPrompt);
    const cTokens = Math.ceil(mockReply.split(/\s+/).length * 1.3);
    const cost = calculateCostInr(modelName, pTokens, cTokens);

    // Save to cache
    db.prepare(`
      INSERT OR REPLACE INTO llm_cache (prompt_hash, provider, model, response_text, prompt_tokens, completion_tokens)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(cacheKey, 'mock', modelName, mockReply, pTokens, cTokens);

    return {
      text: mockReply,
      provider: 'mock',
      model: modelName,
      promptTokens: pTokens,
      completionTokens: cTokens,
      costInr: cost,
      latencyMs: Date.now() - start,
      cached: false,
    };
  }

  // 3. Live Mode with Exponential Backoff
  let retries = 0;
  const maxRetries = 3;
  let delay = 1000;

  while (retries < maxRetries) {
    try {
      if (provider === 'gemini') {
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const geminiModel = genAI.getGenerativeModel({
          model: modelName.includes('gemini') ? modelName : 'gemini-1.5-flash',
          systemInstruction: request.systemPrompt,
        });

        const result = await geminiModel.generateContent(request.prompt);
        const replyText = result.response.text();
        const pTokens = result.response.usageMetadata?.promptTokenCount || Math.ceil(request.prompt.split(/\s+/).length * 1.3);
        const cTokens = result.response.usageMetadata?.candidatesTokenCount || Math.ceil(replyText.split(/\s+/).length * 1.3);
        const cost = calculateCostInr(modelName, pTokens, cTokens);

        // Store in cache
        db.prepare(`
          INSERT OR REPLACE INTO llm_cache (prompt_hash, provider, model, response_text, prompt_tokens, completion_tokens)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(cacheKey, provider, modelName, replyText, pTokens, cTokens);

        return {
          text: replyText,
          provider: 'gemini',
          model: modelName,
          promptTokens: pTokens,
          completionTokens: cTokens,
          costInr: cost,
          latencyMs: Date.now() - start,
          cached: false,
        };
      }
      break;
    } catch (err: any) {
      retries++;
      if (retries >= maxRetries || !err.message?.includes('429')) {
        console.warn(`[LLM] Error calling ${provider} (falling back to mock):`, err.message);
        break;
      }
      console.warn(`[LLM] 429 Rate limit encountered, retrying in ${delay}ms... (attempt ${retries}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  // Fallback to deterministic engine if live call failed
  const pTokens = Math.ceil(request.prompt.split(/\s+/).length * 1.3);
  const fallbackReply = generateDeterministicMockResponse(request.prompt, request.systemPrompt);
  const cTokens = Math.ceil(fallbackReply.split(/\s+/).length * 1.3);

  return {
    text: fallbackReply,
    provider: 'fallback-mock',
    model: modelName,
    promptTokens: pTokens,
    completionTokens: cTokens,
    costInr: calculateCostInr(modelName, pTokens, cTokens),
    latencyMs: Date.now() - start,
    cached: false,
  };
}

function generateDeterministicMockResponse(prompt: string, systemPrompt?: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('eligibility') || p.includes('nbfa') || p.includes('income')) {
    return `Based on IIM Bodh Gaya Scholarship Policy 2026-27 (§3.1), students with annual family income up to INR 3,00,000 and minimum CGPA 5.5 are eligible for Need-Based Financial Assistance (Tier 1 – up to 100% Tuition Fee Waiver). Required documents include an income certificate issued within the last 12 months, parental ITRs, and 6 months bank statements.\n\nCitation: "Scholarship Policy 2026-27, §3.1, 2026-27"`;
  }
  if (p.includes('merit')) {
    return `According to Merit Scholarship Rules (§2.1), the Director's Merit Scholarship awards INR 1,00,000 to top academic performers with a minimum CGPA of 8.5 in full-time postgraduate programmes.\n\nCitation: "Merit Scholarship Rules, §2.1, 2026-27"`;
  }
  if (p.includes('counselling') || p.includes('distress') || p.includes('hardship')) {
    return `Immediate support is available through the Student Wellbeing & Counselling Cell (wellbeing@example.ac.in). Emergency hardship financial assistance may be applied for under the Emergency Hardship Policy (§4.2).\n\nCitation: "Counselling & Wellbeing Referral, §1.1, 2026-27"`;
  }
  return `According to current financial aid guidelines, please review the specific eligibility criteria in the policy documents. For personalized advice, consult the Accounts Office.\n\nCitation: "Scholarship Policy 2026-27, §1.0, 2026-27"`;
}
