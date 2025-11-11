-- ZZIK Platform Database Schema
-- PostgreSQL 15 + PostGIS 3.4
-- Created: 2025-11-11
-- Purpose: Location-based discovery platform with GPS integrity

-- ============================================
-- SETUP: Enable Extensions
-- ============================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  
  -- Gamification
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  
  -- Crypto
  wallet_address VARCHAR(42) UNIQUE, -- Ethereum address
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_level ON users(level DESC);

-- ============================================
-- PLACES (VENUES / BUSINESSES)
-- ============================================

CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Business Info
  business_name VARCHAR(255) NOT NULL,
  business_name_zh VARCHAR(255), -- Chinese name
  business_name_ja VARCHAR(255), -- Japanese name
  category VARCHAR(50) NOT NULL, -- 'cafe', 'restaurant', 'shop', 'beauty', 'hospital'
  subcategory VARCHAR(50),
  
  -- Location
  address TEXT NOT NULL,
  address_detail TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS geography type
  
  -- GPS Integrity Data
  wifi_ssids TEXT[], -- Array of Wi-Fi SSIDs for verification
  wifi_ssids_hash TEXT[], -- Hashed SSIDs (7 days after collection)
  
  -- Business Details
  description TEXT,
  thumbnail_url TEXT,
  phone VARCHAR(20),
  website TEXT,
  hours_open TIME,
  hours_close TIME,
  
  -- Subscription
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'basic', 'pro', 'enterprise'
  subscription_expires_at TIMESTAMP,
  
  -- Status
  verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Spatial index on location (CRITICAL for performance)
CREATE INDEX idx_places_location ON places USING GIST(location);

-- Other indexes
CREATE INDEX idx_places_category ON places(category) WHERE is_active = TRUE;
CREATE INDEX idx_places_subscription ON places(subscription_tier) WHERE is_active = TRUE;
CREATE INDEX idx_places_verified ON places(verified) WHERE is_active = TRUE;

-- Auto-populate location from lat/lng
CREATE OR REPLACE FUNCTION update_place_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_place_location
BEFORE INSERT OR UPDATE ON places
FOR EACH ROW
EXECUTE FUNCTION update_place_location();

-- ============================================
-- CHECK-INS (GPS VERIFIED VISITS)
-- ============================================

CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  
  -- GPS Data (from mobile device)
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION NOT NULL, -- meters
  altitude DOUBLE PRECISION,
  speed DOUBLE PRECISION, -- m/s
  heading DOUBLE PRECISION, -- degrees
  
  -- Wi-Fi Data
  wifi_ssids TEXT[],
  wifi_signal_strengths INTEGER[],
  
  -- Integrity Score (0-100)
  integrity_score INTEGER NOT NULL CHECK (integrity_score >= 0 AND integrity_score <= 100),
  score_distance INTEGER, -- Factor 1: 0-40 points
  score_wifi INTEGER, -- Factor 2: 0-25 points
  score_time INTEGER, -- Factor 3: 0-15 points
  score_accuracy INTEGER, -- Factor 4: 0-10 points
  score_speed INTEGER, -- Factor 5: 0-10 points
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason TEXT,
  
  -- Rewards
  usdc_reward DECIMAL(18, 6), -- USDC amount awarded
  voucher_id UUID, -- Linked voucher (if any)
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  device_info JSONB, -- Device type, OS version, etc.
  idempotency_key VARCHAR(64) UNIQUE -- Prevent duplicates
);

CREATE INDEX idx_checkins_user ON check_ins(user_id);
CREATE INDEX idx_checkins_place ON check_ins(place_id);
CREATE INDEX idx_checkins_status ON check_ins(status);
CREATE INDEX idx_checkins_created ON check_ins(created_at DESC);
CREATE INDEX idx_checkins_idempotency ON check_ins(idempotency_key);

-- Prevent duplicate check-ins (same user + place + day)
CREATE UNIQUE INDEX idx_checkins_user_place_day 
ON check_ins(user_id, place_id, DATE(created_at))
WHERE status = 'approved';

-- ============================================
-- VIDEOS (REELS / UGC CONTENT)
-- ============================================

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  check_in_id UUID REFERENCES check_ins(id) ON DELETE SET NULL,
  
  -- Storage
  storage_key TEXT NOT NULL, -- R2/S3 key
  thumbnail_url TEXT,
  duration INTEGER, -- seconds
  
  -- Content
  caption TEXT,
  hashtags TEXT[],
  
  -- Location (from check-in)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_public BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  moderation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_videos_user ON videos(user_id);
CREATE INDEX idx_videos_place ON videos(place_id) WHERE place_id IS NOT NULL;
CREATE INDEX idx_videos_location ON videos USING GIST(location) WHERE location IS NOT NULL;
CREATE INDEX idx_videos_created ON videos(created_at DESC) WHERE is_public = TRUE;
CREATE INDEX idx_videos_like_count ON videos(like_count DESC) WHERE is_public = TRUE;

-- ============================================
-- VIDEO INTERACTIONS
-- ============================================

CREATE TABLE video_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

CREATE INDEX idx_video_likes_video ON video_likes(video_id);
CREATE INDEX idx_video_likes_user ON video_likes(user_id);

-- Update like count trigger
CREATE OR REPLACE FUNCTION update_video_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos SET like_count = like_count + 1 WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos SET like_count = like_count - 1 WHERE id = OLD.video_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_video_like_count
AFTER INSERT OR DELETE ON video_likes
FOR EACH ROW
EXECUTE FUNCTION update_video_like_count();

CREATE TABLE video_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES video_comments(id) ON DELETE CASCADE, -- For replies
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_video_comments_video ON video_comments(video_id);
CREATE INDEX idx_video_comments_user ON video_comments(user_id);
CREATE INDEX idx_video_comments_parent ON video_comments(parent_id) WHERE parent_id IS NOT NULL;

-- ============================================
-- VOUCHERS (REWARDS)
-- ============================================

CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  check_in_id UUID REFERENCES check_ins(id) ON DELETE SET NULL,
  
  -- Voucher Details
  code VARCHAR(64) UNIQUE NOT NULL,
  qr_code_url TEXT,
  reward_type VARCHAR(20) NOT NULL, -- 'discount', 'free_item', 'cashback'
  reward_value TEXT NOT NULL, -- e.g., "30% off", "Free Americano"
  
  -- Status
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vouchers_user ON vouchers(user_id) WHERE NOT used;
CREATE INDEX idx_vouchers_place ON vouchers(place_id);
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_expires ON vouchers(expires_at) WHERE NOT used;

-- Auto-generate voucher code
CREATE OR REPLACE FUNCTION generate_voucher_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code = encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_voucher_code
BEFORE INSERT ON vouchers
FOR EACH ROW
EXECUTE FUNCTION generate_voucher_code();

-- ============================================
-- USDC TRANSACTIONS
-- ============================================

CREATE TABLE usdc_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in_id UUID REFERENCES check_ins(id) ON DELETE SET NULL,
  
  -- Transaction Details
  amount DECIMAL(18, 6) NOT NULL, -- USDC amount (6 decimals)
  type VARCHAR(20) NOT NULL, -- 'reward', 'withdrawal', 'refund'
  
  -- Blockchain
  tx_hash VARCHAR(66), -- Ethereum transaction hash
  from_address VARCHAR(42),
  to_address VARCHAR(42),
  network VARCHAR(20) DEFAULT 'base-mainnet', -- 'base-mainnet', 'base-testnet'
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  failure_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_usdc_user ON usdc_transactions(user_id);
CREATE INDEX idx_usdc_status ON usdc_transactions(status);
CREATE INDEX idx_usdc_type ON usdc_transactions(type);
CREATE INDEX idx_usdc_created ON usdc_transactions(created_at DESC);
CREATE INDEX idx_usdc_tx_hash ON usdc_transactions(tx_hash) WHERE tx_hash IS NOT NULL;

-- ============================================
-- MISSIONS (GAMIFICATION)
-- ============================================

CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Mission Details
  title VARCHAR(255) NOT NULL,
  title_zh VARCHAR(255),
  title_ja VARCHAR(255),
  description TEXT,
  description_zh TEXT,
  description_ja TEXT,
  
  -- Requirements
  type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'special', 'location'
  target_type VARCHAR(50) NOT NULL, -- 'checkin_count', 'video_upload', 'explore_area'
  target_count INTEGER NOT NULL,
  target_location GEOGRAPHY(POINT, 4326), -- For location-based missions
  target_radius INTEGER, -- meters
  
  -- Rewards
  reward_usdc DECIMAL(18, 6) NOT NULL,
  reward_badge_id UUID, -- Optional badge reward
  
  -- Requirements
  required_level INTEGER DEFAULT 1,
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP DEFAULT NOW(),
  ends_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_missions_type ON missions(type) WHERE active = TRUE;
CREATE INDEX idx_missions_active ON missions(active, starts_at, ends_at);
CREATE INDEX idx_missions_level ON missions(required_level);

-- ============================================
-- USER MISSIONS (PROGRESS TRACKING)
-- ============================================

CREATE TABLE user_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  
  -- Progress
  current_count INTEGER DEFAULT 0,
  target_count INTEGER NOT NULL,
  
  -- Status
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  
  -- Rewards Claimed
  reward_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP,
  
  -- Metadata
  started_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, mission_id)
);

CREATE INDEX idx_user_missions_user ON user_missions(user_id) WHERE NOT completed;
CREATE INDEX idx_user_missions_mission ON user_missions(mission_id);
CREATE INDEX idx_user_missions_completed ON user_missions(completed, completed_at DESC);

-- ============================================
-- BADGES (ACHIEVEMENTS)
-- ============================================

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Badge Details
  name VARCHAR(100) NOT NULL,
  name_zh VARCHAR(100),
  name_ja VARCHAR(100),
  description TEXT,
  emoji VARCHAR(10) NOT NULL,
  icon_url TEXT,
  
  -- Rarity
  rarity VARCHAR(20) NOT NULL, -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
  
  -- Unlock Requirements
  requirement_type VARCHAR(50) NOT NULL, -- 'checkin_count', 'area_explore', 'streak', 'special'
  requirement_value INTEGER NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_badges_rarity ON badges(rarity);

-- ============================================
-- USER BADGES (UNLOCKED)
-- ============================================

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  
  -- Unlock Details
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress_value INTEGER, -- Value when unlocked (e.g., 100 check-ins)
  
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_user_badges_unlocked ON user_badges(unlocked_at DESC);

-- ============================================
-- LEADS (B2B MARKETING)
-- ============================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact Info
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  -- Business Details
  category VARCHAR(50),
  location_count INTEGER,
  message TEXT,
  
  -- Source
  source VARCHAR(50) DEFAULT 'website', -- 'website', 'referral', 'ad'
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  assigned_to UUID REFERENCES users(id),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- Daily active users
CREATE OR REPLACE VIEW daily_active_users AS
SELECT
  DATE(created_at) AS date,
  COUNT(DISTINCT user_id) AS dau
FROM check_ins
WHERE status = 'approved'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Monthly active users
CREATE OR REPLACE VIEW monthly_active_users AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(DISTINCT user_id) AS mau
FROM check_ins
WHERE status = 'approved'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Top places by check-ins
CREATE OR REPLACE VIEW top_places AS
SELECT
  p.id,
  p.business_name,
  p.category,
  COUNT(c.id) AS checkin_count,
  AVG(c.integrity_score) AS avg_integrity_score
FROM places p
JOIN check_ins c ON p.id = c.place_id
WHERE c.status = 'approved'
  AND c.created_at > NOW() - INTERVAL '30 days'
GROUP BY p.id, p.business_name, p.category
ORDER BY checkin_count DESC
LIMIT 100;

-- User leaderboard
CREATE OR REPLACE VIEW user_leaderboard AS
SELECT
  u.id,
  u.username,
  u.avatar_url,
  u.level,
  u.xp,
  COUNT(DISTINCT c.id) AS total_checkins,
  COUNT(DISTINCT v.id) AS total_videos,
  COUNT(DISTINCT ub.id) AS total_badges
FROM users u
LEFT JOIN check_ins c ON u.id = c.user_id AND c.status = 'approved'
LEFT JOIN videos v ON u.id = v.user_id AND v.is_public = TRUE
LEFT JOIN user_badges ub ON u.id = ub.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.avatar_url, u.level, u.xp
ORDER BY u.xp DESC, total_checkins DESC
LIMIT 100;

-- ============================================
-- SEED DATA (OPTIONAL)
-- ============================================

-- Insert sample badges
INSERT INTO badges (name, name_zh, name_ja, description, emoji, rarity, requirement_type, requirement_value) VALUES
('First Check-in', '首次签到', '初回チェックイン', 'Complete your first check-in', '🎉', 'common', 'checkin_count', 1),
('Explorer', '探险家', '探検家', 'Complete 10 check-ins', '🗺️', 'common', 'checkin_count', 10),
('Veteran', '老兵', 'ベテラン', 'Complete 100 check-ins', '🏅', 'rare', 'checkin_count', 100),
('Legend', '传奇', 'レジェンド', 'Complete 1000 check-ins', '👑', 'legendary', 'checkin_count', 1000),
('Gangnam Explorer', '江南探险家', '江南探検家', 'Check in at 10 places in Gangnam', '🌆', 'uncommon', 'area_explore', 10),
('Video Creator', '视频创作者', 'ビデオクリエイター', 'Upload 10 videos', '🎥', 'uncommon', 'video_upload', 10),
('Early Adopter', '早期用户', '早期ユーザー', 'Joined in first 100 users', '🚀', 'epic', 'special', 100);

-- Insert sample missions
INSERT INTO missions (title, title_zh, title_ja, description, type, target_type, target_count, reward_usdc, active) VALUES
('Daily Explorer', '每日探险', 'デイリー探検', 'Check in at 3 places today', 'daily', 'checkin_count', 3, 5000.00, TRUE),
('Weekly Warrior', '每周战士', 'ウィークリーウォリアー', 'Complete 20 check-ins this week', 'weekly', 'checkin_count', 20, 25000.00, TRUE),
('Video Star', '视频明星', 'ビデオスター', 'Upload 5 videos this week', 'weekly', 'video_upload', 5, 15000.00, TRUE);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get nearby places (within radius)
CREATE OR REPLACE FUNCTION get_nearby_places(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 500,
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  business_name VARCHAR,
  category VARCHAR,
  distance_meters DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.business_name,
    p.category,
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_meters,
    p.latitude,
    p.longitude
  FROM places p
  WHERE p.is_active = TRUE
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Calculate user's total USDC balance
CREATE OR REPLACE FUNCTION get_user_usdc_balance(p_user_id UUID)
RETURNS DECIMAL(18, 6) AS $$
DECLARE
  total_balance DECIMAL(18, 6);
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN type IN ('reward', 'refund') THEN amount
      WHEN type = 'withdrawal' THEN -amount
      ELSE 0
    END
  ), 0)
  INTO total_balance
  FROM usdc_transactions
  WHERE user_id = p_user_id
    AND status = 'completed';
    
  RETURN total_balance;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERMISSIONS (OPTIONAL)
-- ============================================

-- Create read-only role for analytics
CREATE ROLE readonly_analytics;
GRANT CONNECT ON DATABASE zzik TO readonly_analytics;
GRANT USAGE ON SCHEMA public TO readonly_analytics;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_analytics;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO readonly_analytics;

-- Create API role with limited permissions
CREATE ROLE api_user WITH LOGIN PASSWORD 'change_me_in_production';
GRANT CONNECT ON DATABASE zzik TO api_user;
GRANT USAGE ON SCHEMA public TO api_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO api_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO api_user;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Schema version tracking
CREATE TABLE schema_versions (
  version VARCHAR(20) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT NOW(),
  description TEXT
);

INSERT INTO schema_versions (version, description) VALUES
('1.0.0', 'Initial schema with PostGIS, GPS integrity, USDC, gamification');

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'ZZIK Database Schema v1.0.0 created successfully!';
  RAISE NOTICE 'PostGIS extension enabled for geospatial queries';
  RAISE NOTICE 'Total tables created: 19';
  RAISE NOTICE 'Total indexes created: 50+';
  RAISE NOTICE 'Total functions created: 2';
END $$;
