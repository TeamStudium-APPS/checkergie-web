"use client";

import { Fragment, useRef, useState, type ReactNode } from "react";
import { isWaitlistAlreadyRegisteredError } from "@checkergie/api";
import LandingHeader from "./landing-header/landing-header";
import LandingHero from "./landing-hero/landing-hero";
import LandingSet1 from "./landing-set1/landing-set1";
import LandingSet2 from "./landing-set2/landing-set2";
import LandingSignup from "./landing-signup/landing-signup";
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
  submitSignup: (email: string) => Promise<void>;
  /* 신청 완료 모달 연결. open/email 전달,
   * 추가 정보 API 저장 성공 시에만 onComplete("saved") 호출
   * 건너뛰기는 onComplete("skipped"), X·ESC·배경 닫기는 onOpenChange(false) 호출
   */
  renderSurvey: (props: SurveyConnection) => ReactNode;
}

const LandingPage = ({
  submitSignup,
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
      document.getElementById(`${location}-signup`)?.scrollIntoView({ block: "center", behavior: "instant" });
      requestAnimationFrame(() => document.getElementById(`${location}-signup`)?.querySelector<HTMLInputElement>('input[name="email"]')?.focus({ preventScroll: true }));
    });
  };
  const request = async (value: string, location: "hero" | "beta") => {
    if (pending.current || open || completed) return;
    pending.current = true;
    try {
      await submitSignup(value);
      setSource(location);
      setEmail(value);
      setCompleted(true);
      setOpen(true);
    } catch (error) {
      if (!isWaitlistAlreadyRegisteredError(error)) throw error;
      setSource(location);
      setEmail(value);
      setAlreadyRegistered(true);
      setCompleted(true);
    } finally { pending.current = false; }
  };
  const complete = () => {
    setOpen(false);
    requestAnimationFrame(() => document.getElementById(`${source}-signup`)?.scrollIntoView({ block: "center", behavior: "instant" }));
  };
  const common = { completed, alreadyRegistered, onOpenProfile: () => { setSource("hero"); setOpen(true); } };

  return <>
    <LandingHeader signupHref="#hero-signup-btm" featuresHref="#set1" routineHref="#set2" completed={completed} />
    <main id="main-content" className="flex-1" aria-label="체커기 랜딩">
      <LandingHero key={`hero-${formVersion}`} {...common} onReset={() => reset("hero")} onRequestSignup={(value) => request(value, "hero")} />
      <div className="flex flex-col gap-cg-8 py-cg-6">
        <LandingSet1 />
        <LandingSet2 />
      </div>
      <LandingSignup key={`beta-${formVersion}`} {...common} onReset={() => reset("beta")} onRequestSignup={(value) => request(value, "beta")} />
    </main>
    <LandingFooter onOpenTerms={onOpenTerms ?? (() => setTermsOpen(true))} onOpenPrivacy={onOpenPrivacy ?? (() => setPrivacyOpen(true))} />
    <Fragment key={`survey-${formVersion}`}>{renderSurvey({ open, email, onComplete: complete, onOpenChange: setOpen })}</Fragment>
    <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
    <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
  </>;
};

export default LandingPage;
