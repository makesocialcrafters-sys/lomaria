-- Performance indexes for Lomaria
CREATE INDEX IF NOT EXISTS idx_connections_to_user_status ON connections(to_user, status);
CREATE INDEX IF NOT EXISTS idx_connections_from_user_status ON connections(from_user, status);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker_blocked ON blocks(blocker_id, blocked_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_messages_connection_created ON messages(connection_id, created_at DESC);