-- Add trial export tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_exports_used INTEGER DEFAULT 0;
