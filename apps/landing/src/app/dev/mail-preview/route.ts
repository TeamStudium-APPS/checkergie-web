import { renderLaunchEmail } from "src/server/mail/launch-email";
import { getMailPreviewConfig } from "src/server/mail/smtp";

export const GET = () => {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }
  const email = renderLaunchEmail(getMailPreviewConfig());
  return new Response(email.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'self'",
    },
  });
};
