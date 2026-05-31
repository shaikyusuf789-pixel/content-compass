-- Create chunks table
CREATE TABLE public.chunks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    script_id UUID REFERENCES public.scripts(id) ON DELETE CASCADE,
    segment_number INTEGER NOT NULL,
    original_text TEXT NOT NULL,
    telugu_text TEXT,
    duration_seconds DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Processing, Done, Failed
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audio_assets table
CREATE TABLE public.audio_assets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chunk_id UUID REFERENCES public.chunks(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    provider TEXT DEFAULT 'openai',
    voice TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create slides table
CREATE TABLE public.slides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chunk_id UUID REFERENCES public.chunks(id) ON DELETE CASCADE,
    image_url TEXT,
    overlay_text TEXT,
    asset_type TEXT DEFAULT 'image', -- image, video
    search_query TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chunks TO authenticated;
GRANT ALL ON public.chunks TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audio_assets TO authenticated;
GRANT ALL ON public.audio_assets TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.slides TO authenticated;
GRANT ALL ON public.slides TO service_role;

-- Enable RLS
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

-- Basic policies (allow authenticated users to do everything for now as it's a internal tool)
CREATE POLICY "Allow all for authenticated on chunks" ON public.chunks FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated on audio_assets" ON public.audio_assets FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated on slides" ON public.slides FOR ALL TO authenticated USING (true);

-- Trigger for updated_at on chunks
CREATE TRIGGER update_chunks_updated_at
BEFORE UPDATE ON public.chunks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
