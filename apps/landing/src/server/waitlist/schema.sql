CREATE TABLE waitlist (
  email       VARCHAR(254) PRIMARY KEY,
  age_group   VARCHAR(16)  NULL CHECK (age_group IN ('10대', '20대', '30대', '40대', '50대 이상')),
  gender      VARCHAR(16)  NULL CHECK (gender IN ('여성', '남성', '기타')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
