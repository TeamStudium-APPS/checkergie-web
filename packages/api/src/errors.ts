import { z } from "zod";

export class ApiValidationError extends Error {
  readonly issues: z.core.$ZodIssue[];

  constructor(error: z.ZodError) {
    super(`API 응답이 예상한 스키마와 일치하지 않습니다.\n${z.prettifyError(error)}`);
    this.name = "ApiValidationError";
    this.issues = error.issues;
  }
}
