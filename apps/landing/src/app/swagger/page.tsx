import { notFound } from "next/navigation";
import SwaggerUi from "./swagger-ui";

export default function SwaggerPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <SwaggerUi />;
}
