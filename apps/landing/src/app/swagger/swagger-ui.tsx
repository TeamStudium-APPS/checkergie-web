"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const SWAGGER_UI_VERSION = "5.33.2";
const SWAGGER_UI_CDN = `https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}`;

declare global {
  interface Window {
    SwaggerUIBundle?: (options: {
      dom_id: string;
      url: string;
    }) => unknown;
  }
}

const SwaggerUi = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const handleScriptLoad = () => setIsScriptLoaded(true);

  useEffect(() => {
    if (!isScriptLoaded || !window.SwaggerUIBundle) return;

    window.SwaggerUIBundle({
      dom_id: "#swagger-ui",
      url: "/api/openapi",
    });
  }, [isScriptLoaded]);

  return (
    <>
      <link rel="stylesheet" href={`${SWAGGER_UI_CDN}/swagger-ui.css`} />
      <Script
        src={`${SWAGGER_UI_CDN}/swagger-ui-bundle.js`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <div id="swagger-ui" />
    </>
  );
};

export default SwaggerUi;
