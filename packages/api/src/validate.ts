import { z } from "zod";

import { ApiValidationError } from "./errors";

export const parseWithSchema = <Schema extends z.ZodType>(
  schema: Schema,
  data: unknown,
): z.infer<Schema> => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiValidationError(result.error);
  }

  return result.data;
};
