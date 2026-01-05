-- Add default_locale to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_locale TEXT DEFAULT 'nb';
