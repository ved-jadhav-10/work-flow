-- Migration 003: Add drift_warnings and routed_module to chat_messages
-- Run once against your Neon PostgreSQL database.

ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS drift_warnings  JSONB    NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS routed_module   VARCHAR  NULL;

COMMENT ON COLUMN chat_messages.drift_warnings IS
    'Array of DriftWarning objects: {type, severity, description, constraint_violated}';

COMMENT ON COLUMN chat_messages.routed_module IS
    'Which module handled the query: learning | developer | workflow | rag';
