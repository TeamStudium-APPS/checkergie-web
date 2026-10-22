import { emailSchema } from "@checkergie/api";

export interface LaunchEmailOptions {
  serviceUrl: string;
  contactEmail: string;
}

const SUBJECT = "[체커기] 기다리던 체커기, 지금 만나보세요";

// 메일 클라이언트는 앱의 CSS와 웹폰트를 공유하지 않으므로 cg 색상을 인라인으로 적용한다.
const COLORS = {
  canvas: "#f8f9fb",
  surface: "#ffffff",
  ink: "#060b11",
  text: "#474b50",
  muted: "#74787c",
  border: "#e5e7e9",
  brand: "#14038e",
  action: "#ffc857",
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]!);

export const validateEmailAddress = (value: string): string => {
  const email = value.trim();
  if (!emailSchema.safeParse(email).success) {
    throw new Error("이메일 주소 하나를 올바른 형식으로 입력해 주세요.");
  }
  return email;
};

export const validateServiceUrl = (value: string): string => {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("서비스 주소는 인증 정보가 없는 HTTPS 주소여야 합니다.");
  }
  return url.href;
};

export const renderLaunchEmail = ({ serviceUrl, contactEmail }: LaunchEmailOptions) => {
  const url = validateServiceUrl(serviceUrl);
  const contact = validateEmailAddress(contactEmail);
  const safeUrl = escapeHtml(url);
  const safeContact = escapeHtml(contact);
  const unsubscribeUrl = escapeHtml(`mailto:${contact}?subject=${encodeURIComponent("체커기 알림 수신 거부 요청")}`);
  const text = [
    "체커기 | CHECKERGIE",
    "기다리던 체커기, 이제 만나보세요.",
    "",
    "안녕하세요. 체커기 팀입니다.",
    "오픈 알림을 신청하고 기다려주셔서 감사합니다. 체커기가 문을 열었어요.",
    "강의를 고르는 첫 순간부터, 체커기와 함께해 주세요.",
    "",
    `체커기 시작하기: ${url}`,
    "",
    "직접 써보신 이야기를 들려주세요. 여러분의 의견으로 더 나은 체커기를 만들어갈게요.",
    `문의 및 의견: ${contact}`,
    "",
    "이 메일은 체커기 오픈 알림을 신청하신 분께 보내드렸습니다.",
    `수신 거부 또는 개인정보 삭제를 원하시면 ${contact}로 요청해 주세요.`,
    "팀 스터디움 · 체커기",
  ].join("\n");

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.canvas};color:${COLORS.ink};font-family:Pretendard,'Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">신청해 주신 체커기 오픈 소식을 전해드려요. 지금 시작해 보세요.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.canvas};">
    <tr><td align="center" style="padding:32px 16px;">
      <!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 28px 24px;">
          <p style="margin:0;color:${COLORS.brand};font-size:20px;font-weight:800;letter-spacing:-0.5px;">체커기 <span style="font-size:11px;letter-spacing:1.5px;">CHECKERGIE</span></p>
        </td></tr>
        <tr><td bgcolor="${COLORS.brand}" style="padding:36px 28px;background-color:${COLORS.brand};">
          <p style="margin:0 0 20px;color:${COLORS.action};font-size:12px;font-weight:700;letter-spacing:2px;">WE ARE OPEN</p>
          <h1 style="margin:0;color:${COLORS.surface};font-size:32px;line-height:1.4;letter-spacing:-1px;word-break:keep-all;">기다리던 체커기,<br />이제 만나보세요.</h1>
          <p style="margin:20px 0 0;color:${COLORS.surface};font-size:15px;line-height:1.8;word-break:keep-all;">강의를 고르는 첫 순간부터,<br />체커기와 함께해 주세요.</p>
        </td></tr>
        <tr><td style="padding:32px 28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.8;">안녕하세요. 체커기 팀입니다.</p>
          <p style="margin:0 0 28px;color:${COLORS.text};font-size:15px;line-height:1.9;word-break:keep-all;">오픈 알림을 신청하고 기다려주셔서 감사합니다.<br />체커기가 문을 열었어요. 지금 바로 만나보세요.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="${COLORS.action}" style="border-radius:8px;background-color:${COLORS.action};text-align:center;mso-padding-alt:16px 28px;">
            <a href="${safeUrl}" style="display:inline-block;padding:16px 28px;border:1px solid ${COLORS.action};border-radius:8px;color:${COLORS.ink};font-size:16px;font-weight:700;text-decoration:none;line-height:1.5;">체커기 시작하기 &rarr;</a>
          </td></tr></table>
          <p style="margin:20px 0 0;color:${COLORS.muted};font-size:12px;line-height:1.7;">버튼이 열리지 않으면 아래 주소를 이용해 주세요.<br /><a href="${safeUrl}" style="color:${COLORS.brand};word-break:break-all;">${safeUrl}</a></p>
        </td></tr>
        <tr><td style="padding:0 28px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="padding-top:24px;border-top:1px solid ${COLORS.border};">
            <p style="margin:0 0 8px;font-size:16px;font-weight:700;">여러분의 첫인상이 궁금해요.</p>
            <p style="margin:0;color:${COLORS.text};font-size:14px;line-height:1.8;word-break:keep-all;">직접 써보신 이야기를 들려주세요.<br />여러분의 의견으로 더 나은 체커기를 만들어갈게요.</p>
            <p style="margin:16px 0 0;font-size:14px;"><a href="mailto:${safeContact}" style="color:${COLORS.brand};">체커기 팀에 의견 보내기</a></p>
          </td></tr></table>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;"><tr><td style="padding:24px 12px;text-align:center;color:${COLORS.muted};font-size:12px;line-height:1.8;word-break:keep-all;">
        <p style="margin:0 0 8px;">이 메일은 체커기 오픈 알림을 신청하신 분께 보내드렸습니다.</p>
        <p style="margin:0 0 12px;"><a href="${unsubscribeUrl}" style="color:${COLORS.text};">수신 거부·개인정보 삭제 요청</a> &nbsp;·&nbsp; <a href="mailto:${safeContact}" style="color:${COLORS.text};">문의하기</a></p>
        <p style="margin:0;">팀 스터디움 · 체커기</p>
      </td></tr></table>
    </td></tr>
  </table>
</body>
</html>`;
  return { subject: SUBJECT, html, text };
};
