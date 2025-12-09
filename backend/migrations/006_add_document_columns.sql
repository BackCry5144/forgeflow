-- Migration: Add document columns for test plan and user manual
-- Date: 2025-12-09
-- Note: test_plan, manual 컬럼이 test_plan_doc, user_manual_doc (BYTEA)로 변경됨

-- 이미 DB에서 컬럼 변경 완료된 경우 이 마이그레이션은 스킵
-- 만약 새로 설정하는 경우 아래 실행:

-- Add test_plan_doc column (Binary for Word document)
ALTER TABLE screens ADD COLUMN IF NOT EXISTS test_plan_doc BYTEA;

-- Add user_manual_doc column (Binary for Word document)
ALTER TABLE screens ADD COLUMN IF NOT EXISTS user_manual_doc BYTEA;

-- Add comments
COMMENT ON COLUMN screens.test_plan_doc IS '테스트 계획서 (Binary Word 문서)';
COMMENT ON COLUMN screens.user_manual_doc IS '사용자 매뉴얼 (Binary Word 문서)';
