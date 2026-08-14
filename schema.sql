-- applications 테이블 생성
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- 네트워크 재시도 시 같은 지원서가 두 번 들어가지 않게 하는 멱등 키
  client_submission_id UUID NOT NULL UNIQUE,

  -- 공통 필수
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  academic_info TEXT NOT NULL,
  residence TEXT NOT NULL,
  activity_location TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  inspiration_source TEXT NOT NULL,

  -- PD
  pd_strategy TEXT,
  pd_idea TEXT,
  pd_tools TEXT,
  pd_experience TEXT,
  pd_comment TEXT,
  pd_inflow_channel TEXT,

  -- 홍보마케터
  mkt_strategy TEXT,
  mkt_tools TEXT,
  mkt_experience TEXT,
  mkt_comment TEXT,
  mkt_inflow_channel TEXT,

  -- 디자이너
  des_challenge TEXT,
  des_portfolio_url TEXT,
  des_comment TEXT,
  des_inflow_channel TEXT
);

-- 보안: Row Level Security (RLS) 활성화
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 익명 사용자(anon)는 오직 INSERT만 허용 (조회, 수정, 삭제 불가능)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.applications TO anon;

CREATE POLICY "Allow anonymous insert only"
ON public.applications
FOR INSERT
TO anon
WITH CHECK (true);

-- SELECT, UPDATE, DELETE 정책은 생성하지 않음 → anon/public 권한으로 조회·수정·삭제 불가

-- 기존 테이블 마이그레이션 (이미 applications가 있으면 이것만 실행)
-- ALTER TABLE public.applications
--   ADD COLUMN IF NOT EXISTS client_submission_id UUID;
-- CREATE UNIQUE INDEX IF NOT EXISTS applications_client_submission_id_uidx
--   ON public.applications (client_submission_id);
