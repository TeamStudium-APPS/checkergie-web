import { notFound } from "next/navigation";
import SwaggerUi from "./swagger-ui";

const SwaggerPage = () => {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <SwaggerUi />;
};

export default SwaggerPage;
