-- Migration: Default Pro Status for New Users
-- Created: 2026-01-14
-- Purpose: Set all new signups to Pro status by default during discovery phase.

-- 1. Update column defaults for the profiles table
ALTER TABLE public.profiles 
ALTER COLUMN is_pro SET DEFAULT true,
ALTER COLUMN subscription_status SET DEFAULT 'active',
ALTER COLUMN plan_type SET DEFAULT 'pro';

-- 2. Update existing users to Pro (Optional, but usually expected for "making all users pro")
UPDATE public.profiles 
SET is_pro = true, 
    subscription_status = 'active', 
    plan_type = 'pro' 
WHERE plan_type IS NULL OR plan_type = 'free';

-- 3. Update the handle_new_user function to be explicit for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_pro, subscription_status, plan_type)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    true,
    'active',
    'pro'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
