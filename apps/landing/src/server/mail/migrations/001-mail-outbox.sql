-- 기존 waitlist를 유지한 채 앱 배포 전에 한 번 적용한다. 과거 신청에 확인 메일을 소급하지 않는다.
BEGIN;

CREATE TABLE mail_suppressions (
  email VARCHAR(254) PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mail_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) NOT NULL REFERENCES waitlist(email) ON DELETE CASCADE,
  kind VARCHAR(16) NOT NULL CHECK (kind IN ('welcome', 'launch')),
  status VARCHAR(16) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'not_sent', 'uncertain')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  retryable BOOLEAN NOT NULL DEFAULT false,
  failure_code VARCHAR(32) CHECK (failure_code IN ('SMTP_TRANSIENT', 'SMTP_REJECTED', 'SMTP_CONFIGURATION', 'SMTP_UNCERTAIN', 'UNEXPECTED_FAILURE')),
  available_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  locked_at TIMESTAMPTZ,
  claim_token UUID,
  message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (email, kind)
);
CREATE INDEX mail_outbox_ready_idx ON mail_outbox (kind, available_at, created_at)
  WHERE status IN ('pending', 'not_sent');
CREATE INDEX mail_outbox_processing_idx ON mail_outbox (locked_at) WHERE status = 'processing';

COMMIT;
