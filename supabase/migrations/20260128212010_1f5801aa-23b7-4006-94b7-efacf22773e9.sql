-- Add intent_details JSONB column for optional detailed preferences per intent
ALTER TABLE users 
ADD COLUMN intent_details jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN users.intent_details IS 
  'Optional detailed preferences per intent (JSONB structure with intent-specific fields)';