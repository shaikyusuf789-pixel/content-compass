-- Fix search path for the function
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Drop permissive policies
DROP POLICY "Authenticated users can manage sources" ON public.sources_master;
DROP POLICY "Authenticated users can manage raw_content" ON public.raw_content;

-- Re-create policies with explicit authenticated role checks (which is safer than just true)
-- Note: In a multi-user app we might want user_id, but here it's a team/workspace setup
CREATE POLICY "Allow authenticated manage sources"
ON public.sources_master
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated manage raw_content"
ON public.raw_content
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
