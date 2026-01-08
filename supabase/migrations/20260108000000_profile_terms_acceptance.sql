-- Migration: Add T&C acceptance tracking to profiles
-- Date: 2026-01-08

-- 1. Add the column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- 2. Update the trigger function to sync terms_accepted_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    default_locale,
    terms_accepted_at
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'default_locale', 'nb'),
    (new.raw_user_meta_data->>'terms_accepted_at')::TIMESTAMP WITH TIME ZONE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
