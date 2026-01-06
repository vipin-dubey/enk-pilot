-- Add mva_amount to receipts and receipt_date (if missing or for clarity)
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS mva_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS receipt_date DATE;

-- Update existing receipts to have a default MVA amount (optional, better to let them be 0 for now)
-- Actually, let's keep it 0 as a default.
