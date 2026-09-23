"use client";

import { useState } from "react";
import { Bell, Mail } from "lucide-react";
import { Button, Form, TextField } from "@checkergie/ui";

export interface EmailSignupFormProps {
  id: string;
  align?: "left" | "center";
  /* LandingPage의 이메일 등록 처리로 연결. 모달은 부모에서 제어 */
  onRequestSignup?: (email: string) => void | Promise<void>;
}

const EmailSignupForm = ({ id, align = "center", onRequestSignup }: EmailSignupFormProps) => {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  return (
    <Form id={id} className={`gap-cg-0 w-full max-w-[560px] ${align === "left" ? "ml-0 mr-auto" : "mx-auto"} [scroll-margin-top:calc(var(--landing-header-height,_calc(var(--spacing-cg-1)_*_28))_+_var(--spacing-cg-6))]`} onSubmit={async (event) => {
      event.preventDefault();
      if (submitting || !onRequestSignup) return;
      const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
      setSubmitting(true);
      setMessage("");
      try { await onRequestSignup(email); }
      catch { setMessage("신청하지 못했어요. 잠시 후 다시 시도해 주세요."); }
      finally { setSubmitting(false); }
    }}>
      <Form.Field
        name="email"
        label="알림 받을 이메일"
        visuallyHiddenLabel
        required
        className="gap-cg-3 [&>p]:px-cg-0 [&>p]:text-[var(--landing-text-inverse-muted)]"
        help="등록하면 개인정보 수집·이용에 동의하는 것으로 봅니다. 수집 항목은 출시 알림 외 다른 용도로 사용하지 않습니다."
      >
        <TextField name="email" type="email" autoComplete="email" placeholder="이메일 주소를 입력해주세요…" leadingIcon={<Mail size={20} aria-hidden="true" />} wrapperClassName="[&&]:rounded-cg-full [&&]:bg-cg-border [&&]:text-cg-ink [&&]:pr-[calc(var(--spacing-cg-1)*1.25)] [&&]:shadow-cg-sm" trailingAction={<Button type="submit" size="sm" loading={submitting} trailingIcon={<Bell size={16} />}>알림 받기</Button>} />
      </Form.Field>
      <p role="status" className="text-cg-caption-sm text-[var(--landing-text-inverse-muted)] mt-cg-3 [&:empty]:hidden">{message}</p>
    </Form>
  );
};
export default EmailSignupForm;
