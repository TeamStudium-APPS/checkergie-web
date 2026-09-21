import { z } from "zod";

export type ApiValidationTarget = "request" | "response";

const TARGET_LABEL: Record<ApiValidationTarget, string> = {
  request: "요청",
  response: "응답",
};

export class ApiValidationError extends Error {
  readonly target: ApiValidationTarget;
  readonly issues: z.core.$ZodIssue[];

  constructor(error: z.ZodError, target: ApiValidationTarget) {
    super(
      `API ${TARGET_LABEL[target]}이 예상한 스키마와 일치하지 않습니다.\n${z.prettifyError(error)}`,
    );
    this.name = "ApiValidationError";
    this.target = target;
    this.issues = error.issues;
  }
}
