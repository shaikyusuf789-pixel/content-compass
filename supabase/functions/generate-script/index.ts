import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/reflection@0.1.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, videoType, inputMode, wordCount, specialInstructions } = await req.json();

    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const numSegs = Math.ceil(wordCount / 165);
    
    const systemPrompt = `
You are an expert Telugu video script writer for SKY Academy.
Write a COMPLETE, ORIGINAL SKY Academy voiceover script on the given topic.
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

    const userPrompt = `
Generate a complete SKY Academy Telugu video script on:

**Topic:** ${topic}
**Video Type:** ${videoType === 'general' ? 'General/Strategy/Motivation' : 'Subjective/Deep Teaching'}
**Segments required:** ${numSegs}
**Words per segment:** STRICTLY 150-180 words
${specialInstructions ? `**Special Instructions:** ${specialInstructions}` : ''}
    `;

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
    const content = aiData.choices[0].message.content;
    
    // Attempt to parse JSON
    let segments = [];
    try {
      // Clean possible markdown fences
      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      segments = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response as JSON", content);
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
