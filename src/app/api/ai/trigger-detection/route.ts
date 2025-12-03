import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { detectTriggersLocal } from '@/lib/ai';
import type { TriggerDetection } from '@/types';

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

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
    if (!anthropic) {
      return NextResponse.json(localResult);
    }

    // For nuanced detection, use Claude
    try {
      const customTriggersList = customTriggers.length > 0
        ? `\n\nCustom triggers to watch for: ${customTriggers.join(', ')}`
        : '';

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        system: `You are analyzing conversation text for communication patterns that may escalate conflict. Be sensitive but not over-reactive. Only flag genuinely harmful patterns, not normal emotional expression.`,
        messages: [
          {
            role: 'user',
            content: `Analyze this statement for communication patterns that may escalate conflict:

"${text}"

Check for:
1. Blame language ("you always," "you never," "you made me")
2. Dismissiveness ("whatever," "I don't care")
3. Contempt markers (sarcasm, mocking)
4. Stonewalling signals ("I'm done," "there's no point")
5. Catastrophizing ("nothing ever changes")${customTriggersList}

Respond with JSON only:
{
  "detected": boolean,
  "patternType": string | null,
  "severity": "low" | "medium" | "high",
  "suggestedIntervention": string (2 sentences max, warm tone, or empty if not detected)
}`,
          },
        ],
      });

      // Parse Claude's response
      const content = response.content[0];
      if (content.type === 'text') {
        try {
          const parsed = JSON.parse(content.text) as Omit<TriggerDetection, 'originalText'>;
          return NextResponse.json({
            ...parsed,
            originalText: text,
          });
        } catch {
          // If parsing fails, return local result
          return NextResponse.json(localResult);
        }
      }

      return NextResponse.json(localResult);
    } catch (apiError) {
      // If API call fails, fall back to local result
      console.error('Claude API error:', apiError);
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
