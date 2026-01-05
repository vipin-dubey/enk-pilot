-- Add YTD fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ytd_gross_income NUMERIC(12,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ytd_expenses NUMERIC(12,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS external_salary_income NUMERIC(12,2) DEFAULT 0;

-- Update allocations table to match new requirements
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS safe_to_spend NUMERIC(12,2);
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS marginal_rate_applied NUMERIC(5,4);

-- Function to update profile YTD values automatically
CREATE OR REPLACE FUNCTION update_profile_ytd()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE profiles 
        SET ytd_gross_income = ytd_gross_income + NEW.gross_amount
        WHERE id = NEW.user_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE profiles 
        SET ytd_gross_income = ytd_gross_income - OLD.gross_amount
        WHERE id = OLD.user_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE profiles 
        SET ytd_gross_income = ytd_gross_income - OLD.gross_amount + NEW.gross_amount
        WHERE id = NEW.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to keep gross income in sync
DROP TRIGGER IF EXISTS on_allocation_inserted ON allocations;
CREATE TRIGGER on_allocation_inserted
    AFTER INSERT OR UPDATE OR DELETE ON allocations
    FOR EACH ROW EXECUTE PROCEDURE update_profile_ytd();

-- Function to update expenses YTD when receipt is processed
CREATE OR REPLACE FUNCTION update_profile_expenses()
RETURNS TRIGGER AS $$
BEGIN
    -- We only count it as an expense if it's processed (triaged)
    IF (NEW.is_processed = true AND (OLD.is_processed = false OR OLD.is_processed IS NULL)) THEN
        UPDATE profiles 
        SET ytd_expenses = ytd_expenses + NEW.amount
        WHERE id = NEW.user_id;
    ELSIF (NEW.is_processed = false AND OLD.is_processed = true) THEN
        UPDATE profiles 
        SET ytd_expenses = ytd_expenses - OLD.amount
        WHERE id = OLD.user_id;
    ELSIF (NEW.is_processed = true AND OLD.is_processed = true AND OLD.amount <> NEW.amount) THEN
        UPDATE profiles 
        SET ytd_expenses = ytd_expenses - OLD.amount + NEW.amount
        WHERE id = NEW.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for receipts
DROP TRIGGER IF EXISTS on_receipt_processed ON receipts;
CREATE TRIGGER on_receipt_processed
    AFTER UPDATE ON receipts
    FOR EACH ROW EXECUTE PROCEDURE update_profile_expenses();
