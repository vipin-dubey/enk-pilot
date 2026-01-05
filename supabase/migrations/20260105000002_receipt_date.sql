-- Add receipt_date column to receipts table
-- This stores the actual date from the receipt (different from created_at which is upload time)
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS receipt_date DATE;

-- Create index for faster queries when grouping by date
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON receipts(receipt_date);
