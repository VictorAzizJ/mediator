import { NextRequest, NextResponse } from 'next/server';
import { openrouter, isAIConfigured } from '@/lib/openrouter';
import { generateReflectionPromptLocal } from '@/lib/ai';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { speakerName, listenerName, transcriptSegment, listenerId } = await request.json();

    if (!speakerName || !listenerName || !transcriptSegment) {
      return NextResponse.json(
        { error: 'Speaker name, listener name, and transcript segment are required' },
        { status: 400 }
      );
    }

    // If no API key, use local generation
    if (!isAIConfigured()) {
      const localPrompt = generateReflectionPromptLocal(
        speakerName,
        listenerName,
        transcriptSegment
      );
      return NextResponse.json({
        ...localPrompt,
        forParticipantId: listenerId || '',
      });
    }

    try {
      const systemPrompt = `You are a compassionate conversation facilitator. Generate reflection prompts that invite curiosity and perspective-taking without taking sides or assuming wrongdoing.`;

      const userPrompt = `Based on this statement from ${speakerName}:

"${transcriptSegment}"

Generate ONE reflection prompt for ${listenerName} that:
- Invites curiosity about ${speakerName}'s underlying feelings
- Does not assume ${listenerName} was wrong
- Uses "might" and "wonder" language (not definitive)
- Is under 25 words

Return ONLY the prompt text, no preamble or explanation.`;

      const response = await openrouter.complete(systemPrompt, userPrompt, {
        maxTokens: 128,
        temperature: 0.7,
      });

      return NextResponse.json({
        id: uuidv4(),
        text: response.trim().replace(/^["']|["']$/g, ''),
        forParticipantId: listenerId || '',
        inResponseTo: transcriptSegment.substring(0, 100),
        dismissed: false,
      });
    } catch (apiError) {
      console.error('OpenRouter API error:', apiError);
      const localPrompt = generateReflectionPromptLocal(
        speakerName,
        listenerName,
        transcriptSegment
      );
      return NextResponse.json({
        ...localPrompt,
        forParticipantId: listenerId || '',
      });
    }
  } catch (error) {
    console.error('Reflection prompt error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reflection prompt' },
      { status: 500 }
    );
  }
}
