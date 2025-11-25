-- 005: screens 테이블에 wizard_data 컬럼 추가
-- Step by Step Wizard에서 입력한 모든 데이터를 저장하기 위한 JSON 컬럼
--
-- ⚠️ 주의: 이 마이그레이션은 이미 init.sql에 포함되었습니다.
-- 새로운 데이터베이스는 init.sql만 실행하면 됩니다.
-- 기존 데이터베이스를 업데이트할 때만 이 파일을 사용하세요.

-- wizard_data 컬럼 추가 (이미 존재하면 무시)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'screens' 
        AND column_name = 'wizard_data'
    ) THEN
        ALTER TABLE screens 
        ADD COLUMN wizard_data JSONB;
        
        -- 컬럼 설명 추가
        COMMENT ON COLUMN screens.wizard_data IS 'Step by Step Wizard 데이터 (step1~step4)';
        
        -- 인덱스 추가 (JSON 검색 성능 향상)
        CREATE INDEX IF NOT EXISTS idx_screens_wizard_data ON screens USING gin (wizard_data);
        
        RAISE NOTICE 'wizard_data 컬럼이 screens 테이블에 추가되었습니다.';
    ELSE
        RAISE NOTICE 'wizard_data 컬럼이 이미 존재합니다.';
    END IF;
END $$;

