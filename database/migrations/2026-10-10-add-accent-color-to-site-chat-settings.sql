-- Add accent color to per-site chat widget settings.
-- Run once against the Agent-To database before deploying the backend.
ALTER TABLE site_chat_settings
  ADD COLUMN accentColor VARCHAR(20) NOT NULL DEFAULT '#F59E0B' AFTER secondaryColor;
