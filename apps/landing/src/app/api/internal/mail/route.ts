import { createMailWorkerHandler } from "src/server/mail/worker";

export const runtime = "nodejs";
export const maxDuration = 60;

// 대상·종류를 요청에서 받지 않는 신청 확인 메일 복구 전용 API다.
export const POST = createMailWorkerHandler();
