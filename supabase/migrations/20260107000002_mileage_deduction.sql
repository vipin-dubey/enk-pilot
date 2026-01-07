-- Add mileage field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estimated_annual_mileage INTEGER DEFAULT 0;
