import { renderLaunchEmail } from "src/server/mail/launch-email";

export const GET = () => {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }
  const email = renderLaunchEmail({
    serviceUrl: process.env.MAIL_SERVICE_URL || "https://example.com/checkergie",
    contactEmail: process.env.MAIL_CONTACT_EMAIL || "hello@example.com",
  });
  return new Response(email.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'self'",
    },
  });
};
