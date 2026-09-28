"use client";

import { useRef, useState, type ReactNode } from "react";
import LandingHeader from "./landing-header/landing-header";
import LandingHero from "./landing-hero/landing-hero";
import LandingSignup from "./landing-signup/landing-signup";
import LandingFooter from "./landing-footer/landing-footer";
import type { LandingFooterProps } from "./landing-footer/landing-footer";

export interface SurveyConnection {
  open: boolean;
  email: string;
  onComplete: (result: "saved" | "skipped") => void;
  onOpenChange: (open: boolean) => void;
}
export interface LandingPageProps extends LandingFooterProps {
  submitSignup?: (email: string) => Promise<void>;
  /* 신청 완료 모달 연결. open/email 전달,
   * 추가 정보 API 저장 성공 시에만 onComplete("saved") 호출
   * 건너뛰기는 onComplete("skipped"), X·ESC·배경 닫기는 onOpenChange(false) 호출
   * 클라이언트 컨테이너에서 renderSurvey={(props) => <SignupModal {...props} />}로 연결
   */
  renderSurvey?: (props: SurveyConnection) => ReactNode;
}

const LandingPage = ({ submitSignup, renderSurvey, onOpenTerms, onOpenPrivacy }: LandingPageProps) => {
  const [completed, setCompleted] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const pending = useRef(false);
  const [source, setSource] = useState<"hero" | "beta">("hero");
  const reset = (location: "hero" | "beta") => {
    setSource(location);
    setCompleted(false);
    setProfileSaved(false);
    setEmail("");
    setOpen(false);
    setFormVersion((value) => value + 1);
    requestAnimationFrame(() => {
      document.getElementById(`${location}-signup`)?.scrollIntoView({ block: "center", behavior: "instant" });
      requestAnimationFrame(() => document.getElementById(`${location}-signup`)?.querySelector<HTMLInputElement>('input[name="email"]')?.focus({ preventScroll: true }));
    });
  };
  const request = async (value: string, location: "hero" | "beta") => {
    if (!submitSignup || pending.current || open || completed) return;
    pending.current = true;
    try {
      await submitSignup(value);
      setSource(location);
      setEmail(value);
      setCompleted(true);
      setOpen(Boolean(renderSurvey));
    } finally { pending.current = false; }
  };
  const complete = (result: "saved" | "skipped") => {
    setOpen(false);
    if (result === "saved") {
      setProfileSaved(true);
    }
    requestAnimationFrame(() => document.getElementById(`${source}-signup`)?.scrollIntoView({ block: "center", behavior: "instant" }));
  };
  const common = { completed, profileSaved, onOpenProfile: renderSurvey ? () => { setSource("hero"); setOpen(true); } : undefined };

  return <>
    <LandingHeader signupHref="#hero-signup-btm" completed={completed} />
    <main id="main-content" className="flex-1" aria-label="체커기 랜딩">
      <LandingHero key={`hero-${formVersion}`} {...common} onReset={() => reset("hero")} onRequestSignup={submitSignup ? (value) => request(value, "hero") : undefined} />
      <LandingSignup key={`beta-${formVersion}`} {...common} onReset={() => reset("beta")} onRequestSignup={submitSignup ? (value) => request(value, "beta") : undefined} />
    </main>
    <LandingFooter onOpenTerms={onOpenTerms} onOpenPrivacy={onOpenPrivacy} />
    {renderSurvey?.({ open, email, onComplete: complete, onOpenChange: setOpen })}
  </>;
};

export default LandingPage;
