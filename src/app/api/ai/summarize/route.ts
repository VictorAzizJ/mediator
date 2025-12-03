import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { generateSummaryLocal } from '@/lib/ai';
import { v4 as uuidv4 } from 'uuid';
import type { TranscriptEntry, Participant, ConversationSummary } from '@/types';

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { transcript, participants, intentions } = await request.json() as {
      transcript: TranscriptEntry[];
      participants: Participant[];
      intentions: { participantId: string; intention: string }[];
    };

    if (!transcript || !participants) {
      return NextResponse.json(
        { error: 'Transcript and participants are required' },
        { status: 400 }
      );
    }

    // If no API key or short conversation, use local generation
    if (!anthropic || transcript.length < 4) {
      const localSummary = generateSummaryLocal(transcript, participants, intentions);
      return NextResponse.json(localSummary);
    }

    try {
      // Format transcript for Claude
      const formattedTranscript = transcript
        .map((entry) => {
          const participant = participants.find((p) => p.id === entry.participantId);
          return `${participant?.name || 'Unknown'}: "${entry.text}"`;
        })
        .join('\n\n');

      const participantNames = participants.map((p) => p.name).join(' and ');

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are summarizing a mediated conversation with complete neutrality. Never assign fault or use blame language. Use phrases like "expressed concern about" not "complained about". Acknowledge both perspectives equally.`,
        messages: [
          {
            role: 'user',
            content: `Summarize this conversation between ${participantNames} with complete neutrality.

TRANSCRIPT:
${formattedTranscript}

Generate a summary with these sections (respond in JSON format):
{
  "topicsDiscussed": ["3-5 bullet points"],
  "participantExpressions": [
    {"participantId": "id", "participantName": "name", "summary": "2-3 sentences about feelings"}
  ],
  "agreements": ["any commitments made, or empty array"],
  "openQuestions": ["unresolved items to revisit"]
}

Rules:
- Never assign fault
- Use neutral, validating language
- Keep total content under 250 words
- Both perspectives must be represented equally`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          // Try to extract JSON from the response
          let jsonText = content.text;

          // Handle markdown code blocks
          const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            jsonText = jsonMatch[1];
          }

          const parsed = JSON.parse(jsonText.trim());

          const summary: ConversationSummary = {
            id: uuidv4(),
            createdAt: Date.now(),
            topicsDiscussed: parsed.topicsDiscussed || [],
            participantExpressions: parsed.participantExpressions || participants.map((p) => ({
              participantId: p.id,
              participantName: p.name,
              summary: 'Participated in the conversation.',
            })),
            agreements: parsed.agreements || [],
            openQuestions: parsed.openQuestions || [],
            privateNotes: [],
          };

          return NextResponse.json(summary);
        } catch {
          // If parsing fails, use local generation
          const localSummary = generateSummaryLocal(transcript, participants, intentions);
          return NextResponse.json(localSummary);
        }
      }

      const localSummary = generateSummaryLocal(transcript, participants, intentions);
      return NextResponse.json(localSummary);
    } catch (apiError) {
      console.error('Claude API error:', apiError);
      const localSummary = generateSummaryLocal(transcript, participants, intentions);
      return NextResponse.json(localSummary);
    }
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
