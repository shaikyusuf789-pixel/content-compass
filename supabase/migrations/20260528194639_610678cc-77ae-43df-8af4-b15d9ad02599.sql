CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to manage settings" 
ON public.app_settings 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Insert default auto-run setting
INSERT INTO public.app_settings (key, value) 
VALUES ('engine_auto_run', '{"enabled": false, "interval_hrs": 1, "last_run": null}')
ON CONFLICT (key) DO NOTHING;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();