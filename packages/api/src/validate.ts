import { z } from "zod";

import { ApiValidationError, type ApiValidationTarget } from "./errors";

export const parseWithSchema = <Schema extends z.ZodType>(
  schema: Schema,
  data: unknown,
  target: ApiValidationTarget,
): z.infer<Schema> => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiValidationError(result.error, target);
  }

  return result.data;
};
