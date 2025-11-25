-- 마이그레이션: Screen 테이블에 AI 생성 진행 상황 추적 컬럼 추가
-- 생성일: 2025-11-18
-- 데이터베이스: PostgreSQL

-- 1. generation_status 컬럼 추가
ALTER TABLE screens ADD COLUMN generation_status VARCHAR(50) DEFAULT 'idle' NOT NULL;
COMMENT ON COLUMN screens.generation_status IS 'AI 생성 진행 상태 (idle, saving_wizard, requesting_ai, waiting_quota, generating, validating, completed, failed)';

-- 2. generation_progress 컬럼 추가
ALTER TABLE screens ADD COLUMN generation_progress INTEGER DEFAULT 0 NOT NULL;
COMMENT ON COLUMN screens.generation_progress IS '생성 진행률 (0-100)';

-- 3. generation_message 컬럼 추가
ALTER TABLE screens ADD COLUMN generation_message VARCHAR(500) NULL;
COMMENT ON COLUMN screens.generation_message IS '현재 진행 단계 메시지';

-- 4. generation_step 컬럼 추가
ALTER TABLE screens ADD COLUMN generation_step INTEGER DEFAULT 0 NOT NULL;
COMMENT ON COLUMN screens.generation_step IS '현재 단계 (1: Wizard 저장, 2: AI 요청, 3: 생성, 4: 검증)';

-- 5. retry_count 컬럼 추가
ALTER TABLE screens ADD COLUMN retry_count INTEGER DEFAULT 0 NOT NULL;
COMMENT ON COLUMN screens.retry_count IS '할당량 초과로 인한 재시도 횟수';

-- 참고: 기존 데이터는 DEFAULT 값으로 자동 설정됨

