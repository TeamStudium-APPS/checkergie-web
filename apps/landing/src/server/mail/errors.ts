import { z } from "zod";
import type { MailDeliveryStatus } from "@checkergie/api";
import type { MailOutcome } from "./schemas";

const messages = {
  INPUT_INVALID: "명령과 옵션을 확인해 주세요.",
  SMTP_TRANSIENT: "SMTP 서버가 일시적으로 발송을 거절했습니다.",
  SMTP_REJECTED: "SMTP 서버가 발송을 거절했습니다. 수신자 또는 발신 설정을 확인하세요.",
  SMTP_CONFIGURATION: "SMTP 연결·인증·설정을 확인해 주세요.",
  SMTP_UNCERTAIN: "SMTP 접수 여부를 확인하지 못했습니다. 재전송 전에 발송 기록을 확인하세요.",
  UNEXPECTED_FAILURE: "메일 작업 중 예상하지 못한 오류가 발생했습니다.",
  DB_CONFIGURATION: "메일 DB 연결 설정을 확인하세요.",
  DB_SCHEMA_MISMATCH: "메일 DB 테이블·컬럼이 없습니다. 마이그레이션 적용 여부를 확인하세요.",
  DB_UNAVAILABLE: "메일 DB에 연결하지 못했습니다. DB 설정과 연결 상태를 확인하세요.",
  DB_RESULT_INVALID: "메일 DB 응답이 스키마와 다릅니다. DB 변경 적용 여부를 확인하세요.",
  CLAIM_LOST: "메일 작업의 선점이 만료됐거나 결과 기록에 실패했습니다.",
  JOB_NOT_UNCERTAIN: "결과 미확인 상태의 작업 ID를 확인해 주세요.",
  WORKER_CONFIGURATION: "복구 작업의 주소·인증 설정을 확인하세요.",
} as const;

export class MailOperationError extends Error {
  constructor(public readonly code: keyof typeof messages) {
    super(messages[code]);
    this.name = "MailOperationError";
  }
}

export class MailDeliveryError extends MailOperationError {
  constructor(
    public readonly deliveryStatus: Exclude<MailDeliveryStatus, "sent">,
    public readonly retryable = false,
    public readonly failureCode: Extract<keyof typeof messages, `SMTP_${string}`> = deliveryStatus === "uncertain" ? "SMTP_UNCERTAIN" : "SMTP_REJECTED",
  ) {
    super(failureCode);
    this.name = "MailDeliveryError";
  }
}

export const failedMailOutcome = (error: unknown): Exclude<MailOutcome, { status: "sent" }> => {
  if (!(error instanceof MailDeliveryError)) return { status: "uncertain", code: "UNEXPECTED_FAILURE" };
  return error.deliveryStatus === "not_sent"
    ? { status: "not_sent", code: error.failureCode, retryable: error.retryable }
    : { status: "uncertain", code: "SMTP_UNCERTAIN" };
};

export const formatMailError = (error: unknown) => {
  if (error instanceof MailOperationError) return `[${error.code}] ${error.message}`;
  if (error instanceof z.ZodError) {
    // 입력값이나 Zod 기본 메시지에 비밀이 포함될 수 있어 필드명만 출력한다.
    const fields = [...new Set(error.issues.map((issue) => issue.path.join(".") || "command"))];
    return `[VALIDATION_FAILED] 설정·입력 형식을 확인하세요: ${fields.join(", ")}`;
  }
  return `[UNEXPECTED_FAILURE] ${messages.UNEXPECTED_FAILURE}`;
};
