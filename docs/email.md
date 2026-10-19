# 오픈 알림 메일

오픈 알림 한 종류의 HTML·일반 텍스트 템플릿과 SmartWork(Daum) SMTP 발송 함수를 제공한다.
폼 등록 API는 변경하지 않으며, 등록 확인 메일은 자동 발송하지 않는다.

## 미리보기

```bash
pnpm dev
```

`http://localhost:3000/dev/mail-preview`에서 실제 발송에 사용하는 HTML을 확인한다.
개발 모드에서만 제공하며 Production에서는 404를 반환한다. SMTP 계정과 DB 없이도
실행된다. 환경변수가 없으면 `example.com` 주소가 표시되므로 실제 발송 주소와 구분한다.

이메일은 앱 CSS·JavaScript와 독립적인 표 기반 레이아웃과 인라인 스타일을 사용한다.
색상은 `packages/ui/src/styles/theme.css`의 cg 브랜드·액션·텍스트 색상을 따른다.
메일 클라이언트에 Pretendard가 없으면 시스템 한글 폰트로 표시한다.

## 로컬 설정

SmartWork 메일 설정에서 앱 비밀번호를 발급한다. 일반 로그인 비밀번호는 사용하지 않는다.

`apps/landing/.env.local`에 다음 값을 설정한다. 비밀번호는 채팅·Git에 남기지 않는다.

```dotenv
SMTP_HOST=smtp.daum.net
SMTP_PORT=465
SMTP_USER=your-smartwork-login-id
SMTP_PASS=your-smartwork-app-password
MAIL_FROM_ADDRESS=checkergie@studium.rehab
MAIL_SERVICE_URL=https://checkergie.vercel.app
MAIL_CONTACT_EMAIL=checkergie@studium.rehab
```

| 변수 | 용도 |
| --- | --- |
| `SMTP_HOST` | SMTP 서버 |
| `SMTP_PORT` | 465(연결부터 TLS) 또는 587(STARTTLS 필수), 기본 465 |
| `SMTP_USER` | SmartWork SMTP 인증에 사용하는 접속 아이디 |
| `SMTP_PASS` | 발송용 앱 비밀번호 |
| `MAIL_FROM_ADDRESS` | 수신자에게 보이는 발신 이메일 주소. SMTP_USER가 이메일이면 생략 가능 |
| `MAIL_SERVICE_URL` | 오픈한 서비스의 실제 HTTPS 주소, 발송 시 필수 |
| `MAIL_CONTACT_EMAIL` | 회신·문의·수신 거부 접수 주소, 생략하면 MAIL_FROM_ADDRESS |

발신자 표시명은 `체커기`로 고정한다. `MAIL_FROM`은 사용하지 않는다.
서버 전용 변수이며 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. 향후 배포 서버에서 발송할
때에는 해당 런타임에도 설정해야 한다. 로컬 명령은 `.env.local`, `.env` 순서로 읽고
이미 설정된 프로세스 환경변수를 덮어쓰지 않는다.

## 테스트 발송

저장소 루트에서 실행한다. `--send`가 없으면 SMTP 연결도 하지 않는 텍스트 미리보기다.

```bash
pnpm --filter @checkergie/landing mail:test --to tester@example.com
```

실제 메일은 아래처럼 수신자 한 명과 `--send`를 명시해야 발송한다.

```bash
pnpm --filter @checkergie/landing mail:test --to tester@example.com --send
```

먼저 팀 내부 테스트 주소로 발송하고 제목, HTML·텍스트 본문, 링크, 모바일 표시,
수신함·스팸함을 확인한다. 브라우저 미리보기는 실제 메일함 호환성 검증을 대체하지 않는다.
SMTP 접수 성공은 최종 수신함 도착을 보장하지 않는다. 연결이 끊겨 결과가 불명확하면
수신함을 확인하기 전에 무조건 재실행하지 않는다.

수신 거부·개인정보 삭제는 문의 메일로 접수하는 방식이다. 담당자가 해당 메일함을
확인하고 DB에서 대상 삭제를 처리해야 한다. 자동 수신 거부 기능은 포함하지 않는다.

## 어드민 연결 지점

`src/server/mail/smtp.ts`의 `createLaunchMailer()`를 서버에서만 호출한다.
`verify()`로 연결을 확인하고 `send(email)`로 한 명씩 발송한 뒤 `close()`를 호출한다.
임의의 수신자에게 발송할 수 있는 공개 HTTP endpoint는 제공하지 않는다.

이번 작업은 템플릿·미리보기·SMTP 연결·단건 테스트 발송까지다. 어드민 일괄 발송에는
관리자 인증, DB 대상 조회, 수신자별 발송 기록, 실패 건 재처리를 연결해야 한다.
이 단건 테스트 명령에는 발송 기록·중복 방지가 없으므로 전체 명단 반복 발송용으로
사용하지 않는다. SmartWork의 발송 제한도 운영 전에 확인한다.

## 검증

```bash
pnpm --filter @checkergie/landing test:mail
pnpm check
```

자동 테스트는 실제 SMTP 서버나 DB에 접속하지 않는다. 템플릿 이스케이프, 잘못된 URL,
다중 수신자·헤더 삽입 거부, SMTP 설정과 승인·거절 흐름을 확인한다.
