-- Add deduction optimization fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_home_office BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_mileage BOOLEAN DEFAULT false;
