import { openapiDocument } from "@checkergie/api/openapi";

export const GET = () => {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }

  return Response.json(openapiDocument);
};
