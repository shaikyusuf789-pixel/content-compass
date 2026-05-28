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
  const key = process.env.LOVABLE_API_KEY!;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
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
  .handler(async () => {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) throw new Error("APIFY_API_TOKEN not configured");

    const { data: sources, error: srcErr } = await supabaseAdmin
      .from("sources_master")
      .select("*")
      .eq("type", "youtube");
    if (srcErr) throw srcErr;
    if (!sources || sources.length === 0) return { processed: 0, message: "No YouTube sources configured." };

    let processed = 0;
    const errors: string[] = [];

    for (const source of sources) {
      try {
        const videos = await apifyRun(
          CHANNEL_SCRAPER,
          { startUrls: [{ url: source.source_url }], maxResults: 3, maxResultsShorts: 0, maxResultStreams: 0 },
          token,
        );

        for (const v of videos.slice(0, 3)) {
          const videoUrl: string = v.url || v.videoUrl;
          if (!videoUrl) continue;

          // dedupe
          const { data: existing } = await supabaseAdmin
            .from("raw_content")
            .select("id")
            .eq("video_url", videoUrl)
            .maybeSingle();
          if (existing) continue;

          // transcript
          let transcript = "";
          try {
            const tr = await apifyRun(TRANSCRIPT_ACTOR, { videoUrl }, token);
            transcript = (tr?.[0]?.transcript || tr?.[0]?.data || tr?.map((x: any) => x.text).join(" ") || "").toString().slice(0, 8000);
          } catch (e) {
            transcript = v.text || v.description || "";
          }

          const aiInput = `Channel: ${source.channel_name}
Original Title: ${v.title}
Views: ${v.viewCount ?? v.views ?? "N/A"}
Duration: ${v.duration ?? "N/A"}

Transcript / Description:
${transcript || v.description || "(no transcript available)"}`;

          const ai = await callAI(aiInput, SYSTEM_PROMPT);

          await supabaseAdmin.from("raw_content").insert({
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
          processed++;
        }
      } catch (e: any) {
        errors.push(`${source.channel_name}: ${e.message}`);
      }
    }

    return { processed, errors, sources: sources.length };
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
