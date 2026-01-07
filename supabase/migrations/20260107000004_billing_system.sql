-- Add monetization and billing fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_type TEXT,
ADD COLUMN IF NOT EXISTS lemon_squeezy_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_founding_user BOOLEAN DEFAULT false;

-- Add check constraint for subscription status
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_status_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check 
    CHECK (subscription_status IN ('free', 'trialling', 'active', 'past_due', 'canceled'));
  END IF;
END $$;
