export const TELUGU_TTS_MASTER_PROMPT = `
================================================================
Telugu Voice Output -- Critical Rules
================================================================

All Telugu content in telugu_text must use Telugu Unicode script characters.
Never use Roman transliteration for Telugu words.

Voice Style:
- Speak like a teacher in a classroom -- slow, clear
- One emotion tag per one or two lines: [Energetic] [Serious] [Calm, Instructional]
- Natural pauses, no robotic style

Punctuation and Flow:
- Use -- (double dash) for natural pauses
- Questions must be answered immediately
- Every line must be meaningful
`;

export const OUTPUT_FORMAT = `
Return ONLY a valid JSON array. No preamble, no markdown fences, no explanation text.
[
  {
    "seg": 1,
    "title": "3-5 word English heading",
    "telugu_text": "full voiceover in TELUGU UNICODE SCRIPT -- NO EMOJIS"
  },
  ...
]
- Generate exactly {NUM_SEGS} segments
- Each segment MUST be 150-180 words
- ALL Telugu words in Telugu Unicode script
- ALL numbers written as English words
`;

export const DNA_GENERAL = `
VIDEO TYPE: GENERAL -- STRATEGY / GUIDANCE / MOTIVATION
High motivation energy. Think passionate senior talking to juniors.
Max three or four strategy memory hints. Community building. Telegram CTA.
`;

export const DNA_SUBJECTIVE = `
VIDEO TYPE: SUBJECTIVE -- DEEP SUBJECT TEACHING
MINIMUM ONE memory hint per major concept.
After each concept: mention PYQ angle naturally.
Last segment: SKY Academy app CTA + Telegram study notes CTA.
`;

export const SYSTEM_TOPIC = `
You are an expert Telugu video script writer for SKY Academy.
Write a COMPLETE, ORIGINAL SKY Academy voiceover script on the given topic.
CRITICAL RULE 1: telugu_text must contain ZERO emoji characters.
CRITICAL RULE 2: ALL numbers in telugu_text must be written as English words.
CRITICAL RULE 3: ALL Telugu words must be in Telugu Unicode script. NEVER Roman transliteration.
CRITICAL RULE 4: Each segment MUST be 150-180 words.
CRITICAL RULE 5: Output must be a complete, valid JSON array.
` + OUTPUT_FORMAT;

