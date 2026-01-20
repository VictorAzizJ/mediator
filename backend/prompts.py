SENTIMENT_EVALUATION_PROMPT = """Analyze the sentiment of the message.

Message to analyze:
Speaker: {speaker}
Text: {message}

Classify the sentiment of this message as positive, negative, or neutral, and provide a brief explanation.

Format your response as JSON with the following structure:
{{
  "label": "positive|negative|neutral",
  "explanation": "brief explanation of why this sentiment classification was chosen"
}}

Provide your analysis in valid JSON format only, no additional text before or after."""


DEAR_MAN_EVALUATION_PROMPT = """You are an expert behavioral therapist evaluating a single message from a conversation. Evaluate how well the message adheres to the DEAR MAN skills.

DEAR MAN Skills:
D - Describe: Did the speaker use factual statements without "I feel"?
E - Express: Did the speaker express feelings using "I feel", "I felt", or emotional words?
A - Assert: Did the speaker assert needs using "I want", "I need", "I'd like"?
R - Reinforce: Did the speaker reinforce their request with "because", "this would", "it helps"?
M - Mindful: Did the speaker stay on topic without tangents?
A - Appear confident: Did the speaker avoid hedging words like "maybe", "just", "sorry"?
N - Negotiate: Did the speaker negotiate using "what if", "would you", "can we"?

Message to analyze:
Speaker: {speaker}
Text: {message}

For each skill, determine if the speaker adhered to it (true/false) and provide a brief explanation. Calculate the total score (0-7, one point per skill).

Format your response as JSON with the following structure:
{{
  "score": 0-7,
  "breakdown": {{
    "describe": {{"adhered": true/false, "explanation": "..."}},
    "express": {{"adhered": true/false, "explanation": "..."}},
    "assert": {{"adhered": true/false, "explanation": "..."}},
    "reinforce": {{"adhered": true/false, "explanation": "..."}},
    "mindful": {{"adhered": true/false, "explanation": "..."}},
    "appear_confident": {{"adhered": true/false, "explanation": "..."}},
    "negotiate": {{"adhered": true/false, "explanation": "..."}}
  }}
}}

Provide your analysis in valid JSON format only, no additional text before or after."""


FAST_EVALUATION_PROMPT = """You are an expert behavioral therapist evaluating a single message from a conversation. Evaluate how well the message adheres to the FAST skills.

FAST Skills:
F - Fair: Was the speaker fair to themselves and others?
A - Apologies: Did the speaker avoid over-apologizing or apologizing for things that aren't their fault?
S - Stick to values: Did the speaker stick to their values and principles?
T - Truthful: Was the speaker truthful and authentic?

Message to analyze:
Speaker: {speaker}
Text: {message}

For each skill, determine if the speaker adhered to it (true/false) and provide a brief explanation. Calculate the total score (0-4, one point per skill).

Format your response as JSON with the following structure:
{{
  "score": 0-4,
  "breakdown": {{
    "fair": {{"adhered": true/false, "explanation": "..."}},
    "apologies": {{"adhered": true/false, "explanation": "..."}},
    "stick_to_values": {{"adhered": true/false, "explanation": "..."}},
    "truthful": {{"adhered": true/false, "explanation": "..."}}
  }}
}}

Provide your analysis in valid JSON format only, no additional text before or after."""


# ---- Transcript-level prompts (entire transcript instead of single message) ----

SENTIMENT_TRANSCRIPT_PROMPT = """Analyze the sentiment of each message in the conversation transcript.

Transcript to analyze:
{transcript}

For each message in the transcript, classify the sentiment as positive, negative, or neutral, and provide a brief explanation.

Format your response as JSON with the following structure:
{{
  "messages": [
    {{
      "speaker": "Speaker A",
      "text": "message text",
      "sentiment": {{
        "label": "positive|negative|neutral",
        "explanation": "brief explanation"
      }}
    }}
  ]
}}

Provide your analysis in valid JSON format only, no additional text before or after."""


DEAR_MAN_TRANSCRIPT_PROMPT = """You are an expert behavioral therapist evaluating a conversation transcript. Evaluate how well each message adheres to the DEAR MAN skills.

DEAR MAN Skills:
D - Describe: Did the speaker use factual statements without "I feel"?
E - Express: Did the speaker express feelings using "I feel", "I felt", or emotional words?
A - Assert: Did the speaker assert needs using "I want", "I need", "I'd like"?
R - Reinforce: Did the speaker reinforce their request with "because", "this would", "it helps"?
M - Mindful: Did the speaker stay on topic without tangents?
A - Appear confident: Did the speaker avoid hedging words like "maybe", "just", "sorry"?
N - Negotiate: Did the speaker negotiate using "what if", "would you", "can we"?

Transcript to analyze:
{transcript}

For each message in the transcript, determine adherence for each skill (true/false) with a brief explanation, and calculate the total DEAR MAN score (0-7, one point per skill).

Format your response as JSON with the following structure:
{{
  "messages": [
    {{
      "speaker": "Speaker A",
      "text": "message text",
      "dear_man": {{
        "score": 0-7,
        "breakdown": {{
          "describe": {{"adhered": true/false, "explanation": "..."}},
          "express": {{"adhered": true/false, "explanation": "..."}},
          "assert": {{"adhered": true/false, "explanation": "..."}},
          "reinforce": {{"adhered": true/false, "explanation": "..."}},
          "mindful": {{"adhered": true/false, "explanation": "..."}},
          "appear_confident": {{"adhered": true/false, "explanation": "..."}},
          "negotiate": {{"adhered": true/false, "explanation": "..."}}
        }}
      }}
    }}
  ]
}}

Provide your analysis in valid JSON format only, no additional text before or after."""


FAST_TRANSCRIPT_PROMPT = """You are an expert behavioral therapist evaluating a conversation transcript. Evaluate how well each message adheres to the FAST skills.

FAST Skills:
F - Fair: Was the speaker fair to themselves and others?
A - Apologies: Did the speaker avoid over-apologizing or apologizing for things that aren't their fault?
S - Stick to values: Did the speaker stick to their values and principles?
T - Truthful: Was the speaker truthful and authentic?

Transcript to analyze:
{transcript}

For each message in the transcript, determine adherence for each skill (true/false) with a brief explanation, and calculate the total FAST score (0-4, one point per skill).

Format your response as JSON with the following structure:
{{
  "messages": [
    {{
      "speaker": "Speaker A",
      "text": "message text",
      "fast": {{
        "score": 0-4,
        "breakdown": {{
          "fair": {{"adhered": true/false, "explanation": "..."}},
          "apologies": {{"adhered": true/false, "explanation": "..."}},
          "stick_to_values": {{"adhered": true/false, "explanation": "..."}},
          "truthful": {{"adhered": true/false, "explanation": "..."}}
        }}
      }}
    }}
  ]
}}

Provide your analysis in valid JSON format only, no additional text before or after."""
