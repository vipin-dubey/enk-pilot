-- Create deadline_submissions table for tracking tax deadline payments
CREATE TABLE IF NOT EXISTS deadline_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deadline_type TEXT NOT NULL, -- 'mva' or 'forskuddsskatt'
  deadline_date DATE NOT NULL,
  marked_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, deadline_type, deadline_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_deadline_submissions_user_id ON deadline_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_deadline_submissions_deadline_date ON deadline_submissions(deadline_date);

-- Enable RLS
ALTER TABLE deadline_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users manage own deadline submissions" ON deadline_submissions;

-- Policy: Users can manage their own deadline submissions
CREATE POLICY "Users manage own deadline submissions"
ON deadline_submissions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
