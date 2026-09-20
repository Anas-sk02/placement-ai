import { parseWithGemini } from './gemini';
import { parsePlacementMessageFallback } from './fallback-rules';
import { PlacementInsight } from '@/types/insight.types';

/**
 * Dual AI & Smart-Rule Extractor Orchestrator
 * Attempts Google Gemini parsing first; if key is absent, rate-limited, or fails,
 * executes deterministic regex smart rules without breaking user workflow.
 */
export async function extractPlacementInsight(
  rawText: string,
  messageTimestamp: string = new Date().toISOString()
): Promise<PlacementInsight> {
  if (!rawText || rawText.trim().length < 10) {
    throw new Error('Message text is too short or empty for placement analysis');
  }

  // 1. Try Gemini Structured Extraction if API Key is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiResult = await parseWithGemini(rawText, messageTimestamp);
      if (geminiResult && geminiResult.is_placement_related) {
        return {
          ...geminiResult,
          raw_message_text: rawText,
          extraction_provider: 'GEMINI',
        };
      }
    } catch (err) {
      console.warn('[PlaceMint AI] Gemini API call failed or timed out. Falling back to Smart-Rules.', err);
    }
  }

  // 2. Fallback to Deterministic Smart Rule Regex Engine
  const fallbackResult = parsePlacementMessageFallback(rawText, messageTimestamp);
  return {
    ...fallbackResult,
    raw_message_text: rawText,
    extraction_provider: 'RULE_FALLBACK',
  };
}
