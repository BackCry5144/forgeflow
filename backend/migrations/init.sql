-- ForgeFlow Database Initialization
-- 테이블이 존재하지 않을 경우에만 생성

-- 1. menus 테이블 생성
CREATE TABLE IF NOT EXISTS menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_folder BOOLEAN NOT NULL DEFAULT FALSE,
    parent_id INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE CASCADE
);

-- menus 테이블 인덱스
CREATE INDEX IF NOT EXISTS ix_menus_id ON menus(id);
CREATE INDEX IF NOT EXISTS ix_menus_parent_id ON menus(parent_id);

-- 2. screens 테이블 생성
CREATE TABLE IF NOT EXISTS screens (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT,
    wizard_data JSONB,
    prototype_html TEXT,
    design_doc TEXT,
    test_plan TEXT,
    manual TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    CONSTRAINT screens_status_check CHECK (status IN ('draft', 'in_review', 'approved'))
);

-- screens 테이블 컬럼 코멘트
COMMENT ON COLUMN screens.prompt IS '사용자 프롬프트 (레거시)';
COMMENT ON COLUMN screens.wizard_data IS 'Step by Step Wizard 데이터 (step1~step4)';

-- screens 테이블 인덱스
CREATE INDEX IF NOT EXISTS ix_screens_id ON screens(id);
CREATE INDEX IF NOT EXISTS ix_screens_menu_id ON screens(menu_id);
CREATE INDEX IF NOT EXISTS idx_screens_wizard_data ON screens USING gin (wizard_data);

-- 3. feedback 테이블 생성
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    screen_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
);

-- feedback 테이블 인덱스
CREATE INDEX IF NOT EXISTS ix_feedback_id ON feedback(id);
CREATE INDEX IF NOT EXISTS ix_feedback_screen_id ON feedback(screen_id);

-- 4. wizard_test_results 테이블 생성 (기존 003 마이그레이션)
CREATE TABLE IF NOT EXISTS wizard_test_results (
    id SERIAL PRIMARY KEY,
    screen_id INTEGER NOT NULL,
    test_scenario TEXT NOT NULL,
    test_result TEXT NOT NULL,
    test_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
);

-- wizard_test_results 테이블 인덱스
CREATE INDEX IF NOT EXISTS ix_wizard_test_results_id ON wizard_test_results(id);
CREATE INDEX IF NOT EXISTS ix_wizard_test_results_screen_id ON wizard_test_results(screen_id);


