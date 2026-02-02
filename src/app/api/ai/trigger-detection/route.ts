import { NextRequest, NextResponse } from 'next/server';
import { openrouter, isAIConfigured } from '@/lib/openrouter';
import { detectTriggersLocal } from '@/lib/ai';
import type { TriggerDetection } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { text, customTriggers = [] } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // First, do local pattern matching (fast)
    const localResult = detectTriggersLocal(text);

    // If local detection found something high severity, return immediately
    if (localResult.detected && localResult.severity === 'high') {
      return NextResponse.json(localResult);
    }

    // If no API key, return local result
    if (!isAIConfigured()) {
      return NextResponse.json(localResult);
    }

    // For nuanced detection, use AI
    try {
      const customTriggersList = customTriggers.length > 0
        ? `\n\nCustom triggers to watch for: ${customTriggers.join(', ')}`
        : '';

      const systemPrompt = `You are analyzing conversation text for communication patterns that may escalate conflict. Be sensitive but not over-reactive. Only flag genuinely harmful patterns, not normal emotional expression.`;

      const userPrompt = `Analyze this statement for communication patterns that may escalate conflict:

"${text}"

Check for:
1. Blame language ("you always," "you never," "you made me")
2. Dismissiveness ("whatever," "I don't care")
3. Contempt markers (sarcasm, mocking)
4. Stonewalling signals ("I'm done," "there's no point")
5. Catastrophizing ("nothing ever changes")${customTriggersList}

Respond with JSON only (no markdown code blocks):
{
  "detected": boolean,
  "patternType": string | null,
  "severity": "low" | "medium" | "high",
  "suggestedIntervention": string (2 sentences max, warm tone, or empty if not detected)
}`;

      const response = await openrouter.complete(systemPrompt, userPrompt, {
        maxTokens: 256,
        temperature: 0.3,
      });

      // Parse AI response
      try {
        // Handle potential markdown code blocks
        let jsonText = response;
        const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        }

        const parsed = JSON.parse(jsonText.trim()) as Omit<TriggerDetection, 'originalText'>;
        return NextResponse.json({
          ...parsed,
          originalText: text,
        });
      } catch {
        // If parsing fails, return local result
        return NextResponse.json(localResult);
      }
    } catch (apiError) {
      // If API call fails, fall back to local result
      console.error('OpenRouter API error:', apiError);
      return NextResponse.json(localResult);
    }
  } catch (error) {
    console.error('Trigger detection error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}
