-- 1. DEADLINE COMPLETIONS
CREATE TABLE IF NOT EXISTS deadline_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  deadline_id TEXT NOT NULL, -- e.g., 'mva-2026-1'
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, deadline_id)
);

-- 2. ENABLE RLS
ALTER TABLE deadline_completions ENABLE ROW LEVEL SECURITY;

-- 3. CREATE POLICIES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own deadline completions') THEN
        CREATE POLICY "Users can manage own deadline completions" ON deadline_completions 
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
