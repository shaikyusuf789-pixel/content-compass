import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const APIFY_BASE = "https://api.apify.com/v2";

// Apify actor IDs (slugs use ~ in API)
const CHANNEL_SCRAPER = "streamers~youtube-channel-scraper";
const TRANSCRIPT_ACTOR = "pintostudio~youtube-transcript";

async function apifyRun(actorId: string, input: unknown, token: string) {
  const res = await fetch(`${APIFY_BASE}/acts/${actorId}/run-sync-get-dataset-items?token=${token}&clean=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify ${actorId} failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return (await res.json()) as any[];
}

async function callAI(prompt: string, system: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not configured in secrets");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errorText.slice(0, 300)}`);
  }
  
  const data = await res.json();
  const content = data.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse AI JSON:", content);
    throw new Error("AI returned invalid JSON format");
  }
}

const SYSTEM_PROMPT = `You are an expert YouTube content strategist specializing in Indian educational and government exam preparation content (SSC, UPSC, RRB, APPSC, Banking).

You analyze competitor videos and generate actionable content intelligence to help creators produce better-performing videos on the same topic.

Always respond in valid JSON format only. No explanation text outside the JSON. Be specific, punchy, and use Indian education context.

JSON schema:
{
  "proposed_title": "Catchy improved title (max 70 chars)",
  "new_thumbnail_outline": "Short visual concept for the thumbnail",
  "target_audience": "Who is this for",
  "core_hooks": ["hook 1", "hook 2", "hook 3"],
  "summary_points": ["point 1", "point 2", "point 3", "point 4", "point 5", "point 6", "point 7"],
  "video_outline": { "hook": "2-3 hook lines", "intro": "intro", "body": "10-15 line body outline" }
}`;

export const runIdeaEngine = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sourceId: z.string().uuid().optional() }).optional())
  .handler(async ({ data: inputData }) => {
    console.log("Starting Idea Engine run...");
    const token = process.env.APIFY_API_TOKEN;
    if (!token) throw new Error("APIFY_API_TOKEN not configured");

    let query = supabaseAdmin.from("sources_master").select("*").eq("type", "youtube");
    if (inputData?.sourceId) {
      query = query.eq("id", inputData.sourceId);
    }

    const { data: sources, error: srcErr } = await query;
    if (srcErr) throw srcErr;
    if (!sources || sources.length === 0) return { processed: 0, message: "No YouTube sources configured." };

    let totalProcessed = 0;
    const errors: string[] = [];

    // Process sources sequentially to avoid overwhelming Apify concurrency limits
    // but parallelize videos within each source.
    for (const source of sources) {
      try {
        console.log(`Scraping channel: ${source.channel_name} (${source.source_url})`);
        const videos = await apifyRun(
          CHANNEL_SCRAPER,
          { startUrls: [{ url: source.source_url }], maxResults: 3, maxResultsShorts: 0, maxResultStreams: 0 },
          token,
        );

        console.log(`Found ${videos.length} videos for ${source.channel_name}`);
        
        const videoPromises = videos.slice(0, 3).map(async (v) => {
          const videoUrl: string = v.url || v.videoUrl;
          if (!videoUrl) return null;

          // dedupe
          const { data: existing } = await supabaseAdmin
            .from("raw_content")
            .select("id")
            .eq("video_url", videoUrl)
            .maybeSingle();
          if (existing) {
            console.log(`Video already exists: ${v.title}`);
            return null;
          }

          console.log(`Processing video: ${v.title} (${videoUrl})`);

          // transcript
          let transcript = "";
          try {
            const tr = await apifyRun(TRANSCRIPT_ACTOR, { videoUrl }, token);
            transcript = (tr?.[0]?.transcript || tr?.[0]?.data || tr?.map((x: any) => x.text).join(" ") || "").toString().slice(0, 8000);
          } catch (e) {
            console.warn(`Transcript failed for ${v.title}, falling back to description.`);
            transcript = v.text || v.description || "";
          }

          const aiInput = `Channel: ${source.channel_name}
Original Title: ${v.title}
Views: ${v.viewCount ?? v.views ?? "N/A"}
Duration: ${v.duration ?? "N/A"}

Transcript / Description:
${transcript || v.description || "(no transcript available)"}`;

          console.log(`Calling AI for: ${v.title}`);
          const ai = await callAI(aiInput, SYSTEM_PROMPT);
          
          console.log(`Inserting raw_content for: ${v.title}`);
          const { error: insErr } = await supabaseAdmin.from("raw_content").insert({
            source_id: source.id,
            video_url: videoUrl,
            original_summary: transcript.slice(0, 2000),
            views: typeof v.viewCount === "number" ? v.viewCount : typeof v.views === "number" ? v.views : null,
            published_date: v.date || v.publishedAt || null,
            duration: v.duration?.toString() ?? null,
            thumbnail_url: v.thumbnailUrl || v.thumbnail || null,
            original_title: v.title,
            proposed_title: ai.proposed_title,
            new_thumbnail_outline: ai.new_thumbnail_outline,
            target_audience: ai.target_audience,
            core_hooks: ai.core_hooks ?? [],
            summary_points: ai.summary_points ?? [],
            video_outline: ai.video_outline ?? {},
            status: "Pending",
          });

          if (insErr) {
            console.error(`Insert failed for ${v.title}:`, insErr);
            throw insErr;
          }

          console.log(`Successfully inserted: ${v.title}`);
          return true;
        });

        const results = await Promise.allSettled(videoPromises);
        results.forEach((r, idx) => {
          if (r.status === "fulfilled") {
            if (r.value) totalProcessed++;
          } else {
            errors.push(`${source.channel_name} (video ${idx}): ${r.reason.message}`);
          }
        });

      } catch (e: any) {
        errors.push(`${source.channel_name}: ${e.message}`);
      }
    }

    return { processed: totalProcessed, errors, sources: sources.length };
  });

const SourceInput = z.object({
  type: z.string().default("youtube"),
  channel_name: z.string().min(1),
  source_url: z.string().url(),
});

export const addSource = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SourceInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("sources_master").upsert(data, { onConflict: 'source_url', ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSource = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("sources_master").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const bulkAddSources = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.array(SourceInput).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("sources_master").upsert(data, { onConflict: 'source_url', ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { ok: true, count: data.length };
  });

export const getIdeas = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ status: z.string().optional() }).parse(d))
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from("raw_content")
      .select("*")
      .order("date_extracted", { ascending: false });

    if (data.status) {
      query = query.eq("status", data.status);
    }

    const { data: ideas, error } = await query;
    if (error) throw error;
    return { ideas: (ideas || []) as any[] };
  });

export const updateIdeaStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid(), status: z.string() }))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("raw_content")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });