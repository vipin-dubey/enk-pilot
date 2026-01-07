-- Add multi-currency support to allocations
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS original_currency TEXT DEFAULT 'NOK';
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS original_amount NUMERIC(12,2);
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(12,6) DEFAULT 1.0;
