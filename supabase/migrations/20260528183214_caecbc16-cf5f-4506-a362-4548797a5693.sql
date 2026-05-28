-- Update status constraint if it exists (assuming it's a text field based on previous view)
-- No explicit constraint found, so we just use the values in application logic.

-- Create scripts table
CREATE TABLE IF NOT EXISTS public.scripts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID REFERENCES public.raw_content(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER,
    video_type TEXT,
    model TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scripts TO authenticated;
GRANT ALL ON public.scripts TO service_role;

-- Enable RLS
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "Users can view all scripts" ON public.scripts FOR SELECT USING (true);
CREATE POLICY "Users can insert scripts" ON public.scripts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their scripts" ON public.scripts FOR UPDATE USING (true);
CREATE POLICY "Users can delete scripts" ON public.scripts FOR DELETE USING (true);

-- Function for updated_at
CREATE TRIGGER update_scripts_updated_at
BEFORE UPDATE ON public.scripts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
