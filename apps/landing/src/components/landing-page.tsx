"use client";

import { Fragment, useRef, useState, type ReactNode } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { isWaitlistAlreadyRegisteredError } from "@checkergie/api";
import LandingHeader from "./landing-header/landing-header";
import LandingHero from "./landing-hero/landing-hero";
import LandingSet1 from "./landing-set1/landing-set1";
import LandingSet2 from "./landing-set2/landing-set2";
import LandingSubscription from "./landing-subscription/landing-subscription";
import LandingFooter from "./landing-footer/landing-footer";
import type { LandingFooterProps } from "./landing-footer/landing-footer";
import TermsModal from "./landing-modals/terms-modal";
import PrivacyModal from "./landing-modals/privacy-modal";

export interface SurveyConnection {
  open: boolean;
  email: string;
  onComplete: (result: "saved" | "skipped") => void;
  onOpenChange: (open: boolean) => void;
}
export interface LandingPageProps extends LandingFooterProps {
  onSubscribe: (email: string) => Promise<void>;
  /* 신청 완료 모달 연결. open/email 전달,
   * 추가 정보 API 저장 성공 시에만 onComplete("saved") 호출
   * 건너뛰기는 onComplete("skipped"), X·ESC·배경 닫기는 onOpenChange(false) 호출
   */
  renderSurvey: (props: SurveyConnection) => ReactNode;
}

const LandingPage = ({
  onSubscribe,
  renderSurvey,
  onOpenTerms,
  onOpenPrivacy,
}: LandingPageProps) => {
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const pending = useRef(false);
  const [source, setSource] = useState<"hero" | "beta">("hero");
  const reset = (location: "hero" | "beta") => {
    setSource(location);
    setCompleted(false);
    setAlreadyRegistered(false);
    setEmail("");
    setOpen(false);
    setFormVersion((value) => value + 1);
    requestAnimationFrame(() => {
      document.getElementById(`${location}-subscription`)?.scrollIntoView({ block: "center", behavior: "instant" });
      requestAnimationFrame(() => document.getElementById(`${location}-subscription`)?.querySelector<HTMLInputElement>('input[name="email"]')?.focus({ preventScroll: true }));
    });
  };
  const request = async (value: string, location: "hero" | "beta") => {
    if (pending.current || open || completed) return;
    pending.current = true;
    try {
      await onSubscribe(value);
      // 이메일은 GA 약관상 개인 식별 정보라 전송하지 않고 등록 건수만 집계한다.
      sendGAEvent("event", "sign_up", { method: "waitlist", form_location: location });
      sendGAEvent("event", "waitlist_submit_result", { form_location: location, result: "success" });
      setSource(location);
      setEmail(value);
      setCompleted(true);
      setOpen(true);
    } catch (error) {
      if (!isWaitlistAlreadyRegisteredError(error)) throw error;
      sendGAEvent("event", "waitlist_submit_result", { form_location: location, result: "already_registered" });
      setSource(location);
      setEmail(value);
      setAlreadyRegistered(true);
      setCompleted(true);
    } finally { pending.current = false; }
  };
  const complete = () => {
    setOpen(false);
    requestAnimationFrame(() => document.getElementById(`${source}-subscription`)?.scrollIntoView({ block: "center", behavior: "instant" }));
  };
  const common = { completed, alreadyRegistered, onOpenProfile: () => { setSource("beta"); setOpen(true); } };

  return <>
    <LandingHeader subscriptionHref="#hero-subscription-btm" featuresHref="#set1" routineHref="#set2" completed={completed} />
    <main id="main-content" className="flex-1" aria-label="체커기 랜딩">
      <LandingHero key={`hero-${formVersion}`} {...common} onReset={() => reset("hero")} onRequestSubscribe={(value) => request(value, "hero")} />
      <div className="flex flex-col gap-cg-8 py-cg-6">
        <LandingSet1 />
        <LandingSet2 />
      </div>
      <LandingSubscription key={`beta-${formVersion}`} {...common} onReset={() => reset("beta")} onRequestSubscribe={(value) => request(value, "beta")} />
    </main>
    <LandingFooter onOpenTerms={onOpenTerms ?? (() => setTermsOpen(true))} onOpenPrivacy={onOpenPrivacy ?? (() => setPrivacyOpen(true))} />
    <Fragment key={`survey-${formVersion}`}>{renderSurvey({ open, email, onComplete: complete, onOpenChange: setOpen })}</Fragment>
    <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
    <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
  </>;
};

export default LandingPage;
