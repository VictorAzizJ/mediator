import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { generateReflectionPromptLocal } from '@/lib/ai';
import { v4 as uuidv4 } from 'uuid';

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

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
    if (!anthropic) {
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
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 128,
        system: `You are a compassionate conversation facilitator. Generate reflection prompts that invite curiosity and perspective-taking without taking sides or assuming wrongdoing.`,
        messages: [
          {
            role: 'user',
            content: `Based on this statement from ${speakerName}:

"${transcriptSegment}"

Generate ONE reflection prompt for ${listenerName} that:
- Invites curiosity about ${speakerName}'s underlying feelings
- Does not assume ${listenerName} was wrong
- Uses "might" and "wonder" language (not definitive)
- Is under 25 words

Return ONLY the prompt text, no preamble or explanation.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return NextResponse.json({
          id: uuidv4(),
          text: content.text.trim().replace(/^["']|["']$/g, ''),
          forParticipantId: listenerId || '',
          inResponseTo: transcriptSegment.substring(0, 100),
          dismissed: false,
        });
      }

      // Fallback to local
      const localPrompt = generateReflectionPromptLocal(
        speakerName,
        listenerName,
        transcriptSegment
      );
      return NextResponse.json({
        ...localPrompt,
        forParticipantId: listenerId || '',
      });
    } catch (apiError) {
      console.error('Claude API error:', apiError);
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
