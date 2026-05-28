-- Create sources_master table
CREATE TABLE public.sources_master (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'youtube',
    channel_name TEXT NOT NULL,
    source_url TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create raw_content table
CREATE TABLE public.raw_content (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id UUID REFERENCES public.sources_master(id) ON DELETE SET NULL,
    video_url TEXT NOT NULL UNIQUE,
    date_extracted TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    original_summary TEXT,
    views BIGINT,
    published_date TIMESTAMP WITH TIME ZONE,
    duration TEXT,
    thumbnail_url TEXT,
    original_title TEXT,
    proposed_title TEXT,
    new_thumbnail_outline TEXT,
    target_audience TEXT,
    core_hooks JSONB, -- Storing 3 hooks as a list
    summary_points TEXT[], -- 7 lines summary points
    video_outline JSONB, -- Hook, Intro, Body
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sources_master TO authenticated;
GRANT ALL ON public.sources_master TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.raw_content TO authenticated;
GRANT ALL ON public.raw_content TO service_role;

-- Enable RLS
ALTER TABLE public.sources_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_content ENABLE ROW LEVEL SECURITY;

-- Policies for sources_master
CREATE POLICY "Authenticated users can manage sources"
ON public.sources_master
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policies for raw_content
CREATE POLICY "Authenticated users can manage raw_content"
ON public.raw_content
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sources_master_updated_at
BEFORE UPDATE ON public.sources_master
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_raw_content_updated_at
BEFORE UPDATE ON public.raw_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
