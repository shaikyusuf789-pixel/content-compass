-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sources_master TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.raw_content TO anon, authenticated;

-- Update policies for sources_master
DROP POLICY IF EXISTS "Allow authenticated manage sources" ON public.sources_master;
CREATE POLICY "Allow public manage sources" ON public.sources_master FOR ALL USING (true) WITH CHECK (true);

-- Update policies for raw_content
DROP POLICY IF EXISTS "Allow authenticated manage raw_content" ON public.raw_content;
CREATE POLICY "Allow public manage raw_content" ON public.raw_content FOR ALL USING (true) WITH CHECK (true);
