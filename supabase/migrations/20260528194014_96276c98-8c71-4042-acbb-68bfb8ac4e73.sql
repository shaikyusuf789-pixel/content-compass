-- Create a table for uploads
CREATE TABLE public.user_uploads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Use GRANT to set permissions for different roles.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_uploads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_uploads TO authenticated;
GRANT ALL ON public.user_uploads TO service_role;

-- Enable Row Level Security
ALTER TABLE public.user_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust if auth is required)
CREATE POLICY "Public Access" ON public.user_uploads FOR SELECT USING (true);
CREATE POLICY "Public Insert" ON public.user_uploads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.user_uploads FOR UPDATE USING (true);
CREATE POLICY "Public Delete" ON public.user_uploads FOR DELETE USING (true);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Public View" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'uploads');
