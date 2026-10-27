import { escapeHtml, validateEmailAddress, validateServiceUrl, type LaunchEmailOptions } from "./launch-email";

export const renderWelcomeEmail = ({ serviceUrl, contactEmail }: LaunchEmailOptions) => {
  const url = validateServiceUrl(serviceUrl);
  const contact = validateEmailAddress(contactEmail);
  const subject = "[체커기] 오픈 알림 신청이 완료됐어요";
  const text = [
    "안녕하세요. 체커기 팀입니다.",
    "체커기 오픈 알림 신청이 완료됐어요.",
    "체커기가 오픈하면 이 이메일로 소식을 전해드릴게요.",
    "여러 플랫폼에 흩어진 강의를 한곳에서 비교할 수 있도록 준비하고 있어요.",
    `체커기 둘러보기: ${url}`,
    "이 메일은 체커기 오픈 알림 신청을 확인하기 위해 보내드렸습니다.",
    `직접 신청하지 않았거나 수신 거부·개인정보 삭제를 원하시면 ${contact}로 요청해 주세요.`,
    "팀 스터디움 · 체커기",
  ].join("\n\n");
  const safeContact = escapeHtml(contact);
  const safeUrl = escapeHtml(url);
  const unsubscribe = escapeHtml(`mailto:${contact}?subject=${encodeURIComponent("체커기 알림 수신 거부 요청")}`);
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${subject}</title></head>
<body style="margin:0;background:#f8f9fb;font-family:Pretendard,'Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;color:#060b11;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7e9;border-radius:16px;">
<tr><td style="padding:28px;color:#14038e;font-size:20px;font-weight:800;">체커기 · CHECKERGIE</td></tr>
<tr><td style="padding:32px 28px;background:#14038e;color:#ffffff;"><h1 style="margin:0;font-size:28px;line-height:1.5;word-break:keep-all;">오픈 알림 신청이 완료됐어요.</h1></td></tr>
<tr><td style="padding:28px;font-size:16px;line-height:1.9;word-break:keep-all;">
<p>안녕하세요. 체커기 팀입니다.</p><p>체커기 오픈 알림을 신청해 주셔서 감사합니다.<br />체커기가 오픈하면 이 이메일로 소식을 전해드릴게요.</p>
<p>여러 플랫폼에 흩어진 강의를 한곳에서 비교할 수 있도록 준비하고 있어요.</p>
<p><a href="${safeUrl}" style="color:#14038e;">체커기 둘러보기 &rarr;</a></p></td></tr></table>
<table role="presentation" width="100%" style="max-width:600px;"><tr><td style="padding:24px 12px;color:#74787c;font-size:12px;line-height:1.8;text-align:center;">
<p>이 메일은 체커기 오픈 알림 신청을 확인하기 위해 보내드렸습니다.</p><p>직접 신청하지 않으셨나요?<br /><a href="${unsubscribe}" style="color:#474b50;">수신 거부·개인정보 삭제 요청</a> · <a href="mailto:${safeContact}" style="color:#474b50;">문의하기</a></p><p>팀 스터디움 · 체커기</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
};
