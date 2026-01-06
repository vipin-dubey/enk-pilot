-- Add manual tax toggle to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS use_manual_tax BOOLEAN DEFAULT false;
