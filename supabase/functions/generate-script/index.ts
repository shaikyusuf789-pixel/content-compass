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
    const { 
      topic, 
      content, 
      videoType, 
      inputMode, 
      wordCount, 
      specialInstructions,
      provider = "poe",
      model = "claude-3-5-sonnet"
    } = await req.json();

    let apiKey = "";
    let apiUrl = "";
    let finalModel = model;

    // Model Mapping
    if (provider === "poe") {
      apiKey = Deno.env.get("POE_API_KEY") || "";
      if (!apiKey) throw new Error("POE_API_KEY is not set in secrets. Please add it in Settings > Secrets.");
      apiUrl = "https://api.poe.com/v1/chat/completions";
      
      // Map to Poe Bot Names
      const poeMap: Record<string, string> = {
        "claude-3-5-sonnet": "Claude-3.5-Sonnet",
        "claude-3-opus": "Claude-3-Opus",
        "gpt-4o": "GPT-4o",
        "gemini-1.5-pro": "Gemini-1.5-Pro"
      };
      finalModel = poeMap[model] || model;

    } else if (provider === "anthropic") {
      apiKey = Deno.env.get("ANTHROPIC_API_KEY") || "";
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set in secrets.");
      apiUrl = "https://api.anthropic.com/v1/messages";
      
      const anthropicMap: Record<string, string> = {
        "claude-3-5-sonnet": "claude-3-5-sonnet-20240620",
        "claude-3-opus": "claude-3-opus-20240229"
      };
      finalModel = anthropicMap[model] || "claude-3-5-sonnet-20240620";

    } else if (provider === "google") {
      apiKey = Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY") || "";
      if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set in secrets.");
      
      const googleMap: Record<string, string> = {
        "gemini-1.5-pro": "gemini-1.5-pro",
        "claude-3-5-sonnet": "gemini-1.5-flash" // Fallback
      };
      finalModel = googleMap[model] || "gemini-1.5-pro";
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${finalModel}:generateContent?key=${apiKey}`;

    } else {
      apiKey = Deno.env.get("OPENAI_API_KEY") || "";
      if (!apiKey) throw new Error("OPENAI_API_KEY is not set in secrets.");
      apiUrl = "https://api.openai.com/v1/chat/completions";
      
      const openaiMap: Record<string, string> = {
        "gpt-4o": "gpt-4o",
        "claude-3-5-sonnet": "gpt-4o" // Fallback
      };
      finalModel = openaiMap[model] || "gpt-4o";
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
      userPrompt = `Generate a SKY Academy Telugu script based on this TRANSCRIPT:\n---\n${content}\n---\nVideo Type: ${videoType}\nSegments: ${numSegs}`;
    } else if (inputMode === "pdf") {
      userPrompt = `Generate a SKY Academy Telugu script based on this BOOK/PDF TEXT:\n---\n${content}\n---\nVideo Type: ${videoType}\nSegments: ${numSegs}`;
    } else {
      userPrompt = `Generate a SKY Academy Telugu script on:\nTopic: ${topic}\nVideo Type: ${videoType}\nSegments: ${numSegs}`;
    }

    if (specialInstructions) {
      userPrompt += `\nSpecial Instructions: ${specialInstructions}`;
    }

    // Default to OpenAI-compatible structure for most providers (including Poe)
    let body = JSON.stringify({
      model: finalModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };

    // Adjust body/headers for specific providers
    if (provider === "anthropic") {
      headers = {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      };
      body = JSON.stringify({
        model: finalModel,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      });
    }

    console.log(`Calling ${provider} API at ${apiUrl} with model ${finalModel}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider} API error:`, errorText);
      throw new Error(`${provider} API error: ${response.status} ${response.statusText}`);
    }

    const aiData = await response.json();
    let result_content = "";

    if (provider === "anthropic") {
      result_content = aiData.content[0].text;
    } else if (provider === "google") {
      result_content = aiData.candidates[0].content.parts[0].text;
    } else {
      // Poe and OpenAI use this
      result_content = aiData.choices[0].message.content;
    }
    
    let segments = [];
    try {
      const cleaned = result_content.replace(/```json/g, "").replace(/```/g, "").trim();
      segments = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response as JSON", result_content);
      throw new Error("Failed to parse script. The AI response was not valid JSON.");
    }

    return new Response(JSON.stringify({ segments }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});