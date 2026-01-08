-- Add date column to allocations
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing records to have date equal to created_at
UPDATE allocations SET date = created_at WHERE date IS NULL;
