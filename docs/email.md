# 신청 확인·오픈 알림 메일

신규 신청 직후 확인 메일(`welcome`)과 서비스 오픈 알림(`launch`)을 제공한다. HTML·일반 텍스트 본문, SmartWork(Daum) SMTP 전송, DB 대기열, 발송 기록, 수신 거부와 실패 복구를 포함한다. 관리자 화면 대신 인증된 복구 API와 운영 명령을 사용한다.

## 배포 순서

1. 기존 DB에 `apps/landing/src/server/mail/migrations/001-mail-outbox.sql`을 한 번 적용한다. 새 DB는 먼저 `src/server/waitlist/schema.sql`을 적용한다. 기존 명단은 보존되고 과거 신청에 확인 메일을 소급하지 않는다.
2. 서버 환경변수를 설정한다. 로컬은 `apps/landing/.env.local`을 사용한다. 비밀을 Git·브라우저·로그에 노출하지 않는다.
3. 앱을 배포한다. 신청과 확인 메일 작업이 한 SQL로 함께 저장되므로 migration 없이 새 앱을 먼저 배포하면 신청이 실패한다.
4. 배포 서버와 GitHub Actions의 Repository secret `MAIL_WORKER_SECRET`을 같은 값으로 설정한다. 배포 확인 후 Repository variable `MAIL_WORKER_ENABLED=true`로 복구 작업을 활성화한다.
5. 팀 내부 테스트 주소의 신규 신청으로 실제 수신함·스팸함·모바일 표시를 확인한다. 자동 테스트는 외부 SMTP와 운영 DB를 사용하지 않는다.

| 변수 | 용도 |
| --- | --- |
| `DATABASE_URL` | Neon DB 연결 문자열 |
| `SMTP_HOST` | `smtp.daum.net` |
| `SMTP_PORT` | 465(기본, TLS) 또는 587(STARTTLS 필수) |
| `SMTP_USER` | SmartWork SMTP 접속 아이디 |
| `SMTP_PASS` | SmartWork에서 발급한 앱 비밀번호 |
| `MAIL_FROM_ADDRESS` | 발신 이메일. SMTP_USER가 이메일이면 생략 가능 |
| `MAIL_SERVICE_URL` | 메일 버튼의 실제 HTTPS 서비스 주소 |
| `MAIL_CONTACT_EMAIL` | 문의·수신 거부 요청 주소. 생략 시 발신 주소 |
| `MAIL_WORKER_SECRET` | 복구 API용 32자 이상 ASCII 무작위 비밀. 서버와 Actions secret에 동일하게 설정 |
| `MAIL_LAUNCH_AT` | 오픈 알림 예약 시각. 시간대를 포함한 ISO 형식. 미설정·빈 값이면 예약 발송 비활성 |
| `MAIL_LAUNCH_BATCH_SIZE` | 예약 오픈 알림 한 번의 최대 처리 수, 기본 10, 범위 1~100 |
| `MAIL_MAX_ATTEMPTS` | 일시 실패의 자동 전송 시도 한도, 기본 3, 범위 1~10 |
| `MAIL_RETRY_DELAY_SECONDS` | 일시 실패 후 대기 초, 기본 600, 범위 60~86400 |
| `MAIL_LEASE_SECONDS` | 실행 중단 판단 초, 기본 300, 범위 120~3600 |

발신자 표시명은 `체커기`다. 로컬 명령은 `.env.local`, `.env` 순으로 읽고 이미 설정된 환경변수를 유지한다. SmartWork 계정의 발송 한도를 확인하고 `--limit`과 실행 주기를 조정한다. 한 실행은 수신자별로 순차 전송한다.

## 신청 직후 확인 메일

신규 이메일 등록은 DB 저장 후 `after()`로 해당 이메일의 확인 메일 1건을 처리한다. 공개 신청 API의 응답 형식은 유지된다. 중복 신청은 메일을 다시 생성하거나 발송하지 않는다. SMTP 장애가 나도 신청은 보존된다.

실패·중단된 작업은 다음 운영 명령으로 처리한다. `--send`가 없으면 조회만 하며 DB 변경과 SMTP 연결을 하지 않는다.

```bash
pnpm --filter @checkergie/landing mail:queue status --kind welcome
pnpm --filter @checkergie/landing mail:queue process --kind welcome --limit 25 --send
```

복구 스케줄러는 `POST /api/internal/mail`에 `Authorization: Bearer <MAIL_WORKER_SECRET>`를 보낸다. 본문·수신자·종류를 받지 않으며 확인 메일만 최대 1건 처리한다. 비밀 누락·짧은 설정은 503, 잘못된 인증은 401이다. 응답은 수신자 없는 건수 집계이며 캐시하지 않는다. 실패가 한 건이라도 있으면 건수 집계와 503을 반환해 스케줄러가 실행 실패를 인지한다.

실행 주체는 `.github/workflows/mail-worker.yml`이다. 활성화 후 5분 간격으로 Production의 `/api/internal/mail`과 `/api/internal/mail/launch`를 각각 POST한다. 전자는 신청 확인 최대 1건, 후자는 아래 예약 조건에 따라 오픈 알림을 처리한다. 한쪽 실패가 다른 쪽 호출을 생략시키지 않으며, 실패가 있으면 Actions도 실패로 표시한다. Actions에는 DB·SMTP 비밀을 복제하지 않는다. 중복 실행을 직렬화하고 요청 제한은 각각 65초·305초다. Actions의 Run workflow로 같은 경로를 수동 실행할 수 있다. `MAIL_WORKER_ENABLED`가 없거나 false이면 실행하지 않는다.

GitHub 정기 작업은 기본 브랜치에 병합된 파일로 실행되며 지연될 수 있어 즉시 발송의 보장 수단으로 사용하지 않는다. 이 작업은 드물게 실패한 확인 메일의 복구를 담당하며, 대기 건수가 실행 처리량보다 많으면 운영 명령으로 추가 처리한다. 설정·배포·실제 수신을 확인하기 전까지 운영 연결이 완료됐다고 판단하지 않는다. [GitHub 실행 조건](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)을 따른다.

## 예약 시각에 오픈 알림 자동 발송

별도 관리자 화면 없이 서버 환경변수 `MAIL_LAUNCH_AT`을 예약 시각으로 사용한다. 오픈 시각이 미정이면 값을 설정하지 않는다. 빈 값도 비활성으로 처리한다. `MAIL_WORKER_ENABLED=true`여도 시각이 없으면 오픈 알림은 발송하지 않는다.

시각 확정 후 Production 환경변수에 `YYYY-MM-DDTHH:mm:ss+09:00` 형식의 값을 설정하고 해당 설정으로 다시 배포한다. Zod가 실제 날짜·시간대를 검증한다. 잘못된 날짜나 시간대 없는 값은 실행 오류로 처리하며 발송하지 않는다.

인증된 `/api/internal/mail/launch`는 다음 순서로 처리한다.

1. 시각 미설정 또는 예약 시각 이전이면 DB·SMTP 접근 없이 0건을 반환한다.
2. 예약 시각 이후면 해당 시각까지 신청한 명단을 `launch` 대기열에 추가한다. 수신 거부자를 제외하고 유일성 제약으로 중복 생성을 막는다.
3. 기본 최대 10건을 처리하고, 실행 시작 후 240초가 지나면 새 작업을 선점하지 않는다. 함수 실행 제한은 300초다. 처리 중 강제 종료된 작업은 기존 미확인 격리 규칙을 따른다.
4. 남은 작업·재시도 가능한 일시 실패는 다음 정기 실행에서 이어서 처리한다. 성공한 수신자에게 다시 보내지 않는다. 예약 시각 이후 새 신청자는 이번 명단에 포함하지 않는다.

정확히 예약 시각에 모든 메일이 동시에 도착하는 방식은 아니다. 예약 시각이 지난 뒤 정기 작업이 시작하며, Actions 지연·대상 수·SMTP 제한에 따라 완료 시점이 달라진다. 배포 전에 대상 규모에 맞춰 처리 수와 SMTP 제한을 확인한다. 발송 시작 이후에는 대상 마감이 바뀌지 않도록 예약 시각을 고정한다.

## 수동 오픈 알림 일괄 발송

오픈 시점의 대상 마감 시각을 시간대가 포함된 ISO 형식으로 고정한다. 아래 시각은 예시이며 실제 운영 시각으로 바꾼다.

```bash
pnpm --filter @checkergie/landing mail:queue launch --before 2026-10-25T12:00:00+09:00
pnpm --filter @checkergie/landing mail:queue launch --before 2026-10-25T12:00:00+09:00 --send
pnpm --filter @checkergie/landing mail:queue status --kind launch
pnpm --filter @checkergie/landing mail:queue process --kind launch --limit 25 --send
```

첫 명령은 대상과 상태만 조회한다. 두 번째는 마감 시각까지의 신청자 중 수신 거부자를 제외해 대기열만 만들며 메일은 보내지 않는다. 마지막 `process` 명령이 최대 25건씩 전송한다. 대상 확정과 전송을 분리하므로 마감 시각을 지정한 명령이 기존 대기열까지 바로 발송하지 않는다. 같은 마감 시각으로 `launch`를 반복해도 `(email, kind)` 유일성 제약 때문에 이미 생성된 작업은 중복 생성되지 않는다. `process`의 `--limit` 범위는 1~100, 기본 25다. `process`는 해당 종류의 전체 대기열을 대상으로 하며 마감 시각 필터가 아니다.

이 구현은 수신자당 최초 오픈 알림 한 번을 위한 기능이다. 새로운 홍보 캠페인을 보내려고 기록을 지우거나 종류를 재사용하지 않는다. 신청 확인 복구 API는 오픈 알림을 발송하지 않으며, 예약 경로는 오픈 시각 전에는 전송하지 않는다. 수동 `launch`·`process` 명령은 예약 시각과 독립된 운영 작업이므로 `--send` 사용 전에 발송 여부를 확인한다.

## 상태와 재처리

| 상태 | 의미·처리 |
| --- | --- |
| `pending` | 발송 대기 |
| `processing` | 실행이 원자적으로 선점한 상태. 기본 5분 이상 지나면 다음 worker 실행에서 `uncertain`으로 전환 |
| `sent` | SMTP 접수 성공. 자동 재발송 제외. 최종 수신함 도착 보장은 아님 |
| `not_sent` | 미접수 확인. SMTP 4xx 일시 거절만 기본 10분 후, 최대 3회 시도. 5xx 영구 거절·설정 오류는 자동 재시도 제외 |
| `uncertain` | 연결 종료·예상하지 못한 오류·실행 중단으로 접수 여부 미확인. 자동 재시도 제외 |

`status` 조회는 상태별 건수·안전한 실패 코드별 건수·결과 미확인 작업 UUID를 출력한다. 이메일·SMTP 오류 원문을 출력하지 않는다. 조회는 상태를 변경하지 않으므로 오래된 `processing`은 worker를 실행해야 격리된다. SMTP 설정·연결 검증 실패는 선점 전에 중단되어 시도 횟수를 소모하지 않는다.

원인을 고친 뒤 자동 시도 한도에 도달했거나 영구 거절된 `not_sent` 작업을 명시적으로 다시 처리할 수 있다. 이 명령은 메일을 보내지 않으며 다음 `process`가 처리한다.

```bash
pnpm --filter @checkergie/landing mail:queue retry --kind welcome --send
```

결과 미확인은 SMTP 제공자 기록·수신함을 확인하고 작업 UUID별로 수동 확정한다. `not_sent`로 바꾸면 다음 실행에서 다시 전송될 수 있다. 이미 접수됐다면 `sent`를 사용한다.

```bash
pnpm --filter @checkergie/landing mail:queue resolve --id UUID --status sent --send
pnpm --filter @checkergie/landing mail:queue resolve --id UUID --status not_sent --send
```

SMTP 전송과 DB 저장은 하나의 트랜잭션으로 묶을 수 없다. 접수 후 DB 기록이 실패하면 실행을 중단하고 해당 작업을 추후 미확인으로 격리한다. 고정 Message-ID는 추적용이며 메일 서버의 중복 제거를 보장하지 않는다.

## 수신 거부·개인정보 삭제

메일의 문의·수신 거부 링크는 운영 메일함으로 연결된다. 담당자가 요청을 확인하고 아래 명령으로 주소를 제외한다. 대소문자는 소문자로 정규화된다.

```bash
pnpm --filter @checkergie/landing mail:queue suppress --email recipient@example.com --send
```

수신 거부 주소는 이후 대기열 선점에서 제외된다. 이미 전송 중인 메일은 취소할 수 없다. 개인정보 삭제 요청은 DB에서 해당 `waitlist` 행과 `mail_suppressions` 행을 모두 삭제한다. `waitlist` 삭제는 연결된 발송 작업·기록도 삭제한다. 공개 이메일 입력만으로 다른 사람의 구독을 해지하는 endpoint는 제공하지 않는다.

## 미리보기·단건 테스트

개발 서버의 `/dev/mail-preview`는 오픈 알림, `/dev/mail-preview?kind=welcome`은 신청 확인 HTML이다. Production에서는 404다. SMTP·DB 설정 없이 볼 수 있고, 환경변수가 없으면 예시 주소를 쓴다.

기존 단건 발송은 대기열과 독립된 팀 내부 테스트 용도다. 발송 기록·중복 방지가 없으므로 전체 명단 발송에 사용하지 않는다.

```bash
pnpm --filter @checkergie/landing mail:preview --to tester@example.com
pnpm --filter @checkergie/landing mail:send --to tester@example.com
pnpm --filter @checkergie/landing mail:preview --kind welcome --to tester@example.com
pnpm --filter @checkergie/landing mail:send --kind welcome --to tester@example.com
pnpm --filter @checkergie/landing test:mail
pnpm check
```

테스트는 임시 PGlite PostgreSQL에서 migration, 원자적 등록, 중복 방지, 작업 선점, 지연 재시도·한도, 미확인 격리·복구, 수신 거부와 삭제 연쇄 동작을 검증한다. 운영 Neon 연결과 메일함 도착은 별도 확인한다. rollback은 이전 앱으로 되돌리고 신규 테이블은 유지해 기록을 보존한다.

일괄 발송 명령은 미접수·결과 미확인이 한 건이라도 있으면 집계를 출력한 후 종료 코드 1을 반환한다. 성공한 작업은 재실행해도 다시 보내지 않는다.


## 검증·설계 기준

입력·설정·DB 응답은 `src/server/mail/schemas.ts`의 Zod 스키마로 검증하고 타입을 유도한다. 공유되는 메일 종류·접수 상태는 `packages/api`가 소유한다. CLI·SMTP 설정·DB 작업처럼 랜딩 서버에만 필요한 계약은 공용 패키지로 올리지 않는다. 명령별 옵션은 구분된 스키마로 검증하므로 다른 명령의 옵션을 섞으면 오류다.

입력 오류는 필드명, SMTP·DB 장애는 안정적인 코드로 구분한다. 오류 원문·Zod 입력값·주소·비밀번호는 출력하지 않는다. 테스트는 잘못된 날짜·UUID, 명령 옵션, 설정, 일시/영구 SMTP 실패, 기록·재처리와 복구 API 인증을 포함하며 CI에서 실행한다. PGlite의 단일 인스턴스 테스트는 운영 Neon의 다중 연결 락 경합이나 Next.js `after()`의 실제 플랫폼 실행, 실제 메일함 도착을 검증하지 않는다.
