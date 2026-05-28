ALTER TABLE public.user_uploads ADD COLUMN display_name TEXT;

-- Update existing rows to have display_name equal to file_name
UPDATE public.user_uploads SET display_name = file_name WHERE display_name IS NULL;