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

export default function SwaggerUi() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !window.SwaggerUIBundle) return;

    window.SwaggerUIBundle({
      dom_id: "#swagger-ui",
      url: "/api/openapi",
    });
  }, [scriptLoaded]);

  return (
    <>
      <link rel="stylesheet" href={`${SWAGGER_UI_CDN}/swagger-ui.css`} />
      <Script
        src={`${SWAGGER_UI_CDN}/swagger-ui-bundle.js`}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div id="swagger-ui" />
    </>
  );
}
