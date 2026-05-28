import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, content, videoType, inputMode, wordCount, specialInstructions } = await req.json();

    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const numSegs = Math.ceil(wordCount / 165);
    
    const dnaGeneral = `
DNA RULES FOR GENERAL:
1. Hook (Seg 1): Start with a relatable problem or burning ambition.
2. The 'Why': Explain why this strategy matters for Group 1/2 exams.
3. Memory Techniques: Use analogies like "War Strategy" or "Life Balance".
4. Community: Emphasize that SKY Academy students are a family.
5. CTA: Must mention the Telegram group for daily motivation.
    `;

    const dnaSubjective = `
DNA RULES FOR SUBJECTIVE:
1. Logic First: Explain the concept simply before adding complexity.
2. The "Link": Connect current topic to previous topics (holistic view).
3. PYQ Alert: Explicitly mention if this concept was asked in 2022 or 2023 exams.
4. Memory Key: Use mnemonics or funny stories to lock the concept.
5. Final Seg: Summarize and direct to the App for full test series.
    `;

    let systemPromptBase = "";
    if (inputMode === "transcript") {
      systemPromptBase = `
You are an expert Telugu video script writer for SKY Academy.
Your task is to REWRITE the provided video transcript into a SKY Academy voiceover script.
Keep the technical facts and core information, but change the delivery to match SKY Academy's educational DNA.
      `;
    } else if (inputMode === "pdf") {
      systemPromptBase = `
You are an expert Telugu video script writer for SKY Academy.
Your task is to CREATE a SKY Academy video script based on the provided text from a book or PDF section.
Translate and adapt the educational content into a clear, teaching-focused voiceover.
      `;
    } else {
      systemPromptBase = `
You are an expert Telugu video script writer for SKY Academy.
Write a COMPLETE, ORIGINAL SKY Academy voiceover script on the given topic.
      `;
    }

    const systemPrompt = `
${systemPromptBase}

${videoType === 'general' ? dnaGeneral : dnaSubjective}

CRITICAL RULE 1: telugu_text must contain ZERO emoji characters.
CRITICAL RULE 2: ALL numbers in telugu_text must be written as English words.
CRITICAL RULE 3: ALL Telugu words must be in Telugu Unicode script. NEVER Roman transliteration.
CRITICAL RULE 4: Each segment MUST be 150-180 words.
CRITICAL RULE 5: Output must be a complete, valid JSON array.

Return ONLY a valid JSON array. No preamble, no markdown fences, no explanation text.
[
  {
    "seg": 1,
    "title": "3-5 word English heading",
    "telugu_text": "full voiceover in TELUGU UNICODE SCRIPT -- NO EMOJIS"
  }
]
- Generate exactly ${numSegs} segments
- Each segment MUST be 150-180 words
- ALL Telugu words in Telugu Unicode script
- ALL numbers written as English words
    `;

    let userPrompt = "";
    if (inputMode === "transcript") {
      userPrompt = `
Generate a SKY Academy Telugu script based on this TRANSCRIPT:
---
${content}
---
Video Type: ${videoType === 'general' ? 'General/Strategy' : 'Subjective/Teaching'}
Segments: ${numSegs}
${specialInstructions ? `Special Instructions: ${specialInstructions}` : ''}
      `;
    } else if (inputMode === "pdf") {
      userPrompt = `
Generate a SKY Academy Telugu script based on this BOOK/PDF TEXT:
---
${content}
---
Video Type: ${videoType === 'general' ? 'General/Strategy' : 'Subjective/Teaching'}
Segments: ${numSegs}
${specialInstructions ? `Special Instructions: ${specialInstructions}` : ''}
      `;
    } else {
      userPrompt = `
Generate a SKY Academy Telugu script on:
Topic: ${topic}
Video Type: ${videoType === 'general' ? 'General/Strategy' : 'Subjective/Teaching'}
Segments: ${numSegs}
${specialInstructions ? `Special Instructions: ${specialInstructions}` : ''}
      `;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    const result_content = aiData.choices[0].message.content;
    
    // Attempt to parse JSON
    let segments = [];
    try {
      const cleaned = result_content.replace(/```json/g, "").replace(/```/g, "").trim();
      segments = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response as JSON", result_content);
      throw new Error("Failed to parse script. Please try again.");
    }

    return new Response(JSON.stringify({ segments }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});