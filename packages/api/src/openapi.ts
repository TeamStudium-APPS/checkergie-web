import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  waitlistErrorResponseSchema,
  waitlistProfileRequestSchema,
  waitlistProfileResponseSchema,
  waitlistSubscribeRequestSchema,
  waitlistSubscribeResponseSchema,
} from "./schemas/waitlist";

const registry = new OpenAPIRegistry();

// zod v4 exposes metadata through `.meta`; attach the library's expected
// method to each root schema without changing the API validation schemas.
const withOpenApi = (schema: z.ZodType) => {
  Object.defineProperty(schema, "openapi", {
    configurable: true,
    value: (refOrMetadata: string | Record<string, unknown>) =>
      schema.meta(typeof refOrMetadata === "string" ? { id: refOrMetadata } : refOrMetadata),
  });
  return schema;
};

registry.register("WaitlistSubscribeRequest", withOpenApi(waitlistSubscribeRequestSchema));
registry.register("WaitlistSubscribeResponse", withOpenApi(waitlistSubscribeResponseSchema));
registry.register("WaitlistProfileRequest", withOpenApi(waitlistProfileRequestSchema));
registry.register("WaitlistProfileResponse", withOpenApi(waitlistProfileResponseSchema));
registry.register("WaitlistErrorResponse", withOpenApi(waitlistErrorResponseSchema));

const validationErrorSchema = registry.register("ValidationErrorResponse", withOpenApi(z.object({ message: z.string() })));
const serverErrorSchema = registry.register("ServerErrorResponse", withOpenApi(z.object({ message: z.string() })));
const validationErrorContent = {
  schema: validationErrorSchema,
  example: { message: "올바른 이메일 형식이 아닙니다." },
};
const serverErrorContent = {
  schema: serverErrorSchema,
  example: { message: "잠시 후 다시 시도해 주세요." },
};
const serverErrorResponse = {
  500: { description: "예상하지 못한 서버 오류입니다.", content: { "application/json": serverErrorContent } },
  503: { description: "대기자 저장소를 일시적으로 사용할 수 없습니다.", content: { "application/json": serverErrorContent } },
};

registry.registerPath({
  method: "get",
  path: "/api/waitlist",
  tags: ["Waitlist"],
  summary: "대기자 API 연결 확인",
  description: "데이터를 조회하지 않고 대기자 저장소 연결 상태만 확인합니다. 성공 시 응답 본문 없이 204를 반환합니다.",
  responses: {
    204: { description: "대기자 저장소에 연결할 수 있습니다." },
    500: { description: "예상하지 못한 서버 오류입니다." },
    503: { description: "대기자 저장소를 일시적으로 사용할 수 없습니다." },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/waitlist",
  tags: ["Waitlist"],
  summary: "대기자 등록",
  description: "이메일 주소를 대기자 명단에 등록합니다.",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: waitlistSubscribeRequestSchema, example: { email: "user@example.com" } } },
    },
  },
  responses: {
    200: { description: "대기자 등록 성공", content: { "application/json": { schema: waitlistSubscribeResponseSchema } } },
    400: { description: "요청 본문이 올바르지 않습니다.", content: { "application/json": validationErrorContent } },
    409: {
      description: "이미 등록된 이메일입니다.",
      content: { "application/json": { schema: waitlistErrorResponseSchema, example: { code: "ALREADY_REGISTERED" } } },
    },
    ...serverErrorResponse,
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/waitlist/profile",
  tags: ["Waitlist"],
  summary: "대기자 프로필 저장",
  description: "대기자 이메일에 연령대와 성별 정보를 저장합니다.",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: waitlistProfileRequestSchema,
          example: { email: "user@example.com", ageGroup: "20대", gender: "기타" },
        },
      },
    },
  },
  responses: {
    200: { description: "대기자 프로필 저장 성공", content: { "application/json": { schema: waitlistProfileResponseSchema } } },
    400: { description: "요청 본문이 올바르지 않습니다.", content: { "application/json": validationErrorContent } },
    ...serverErrorResponse,
  },
});

export const openapiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: "3.0.3",
  info: {
    title: "Checkergie API",
    version: "0.1.0",
    description: "Checkergie 랜딩 페이지에서 사용하는 API 문서입니다.",
  },
  servers: [{ url: "/", description: "현재 서버" }],
  tags: [{ name: "Waitlist", description: "대기자 등록 및 프로필 API" }],
});
