"use client";

import SignupComplete from "../landing-hero/signup-complete";
import WaitlistEmailForm from "./waitlist-email-form";
import type { LandingHeroProps } from "../landing-hero/landing-hero";

const LandingSignup = ({ completed, alreadyRegistered = false, onRequestSignup, onReset, onOpenProfile, }: LandingHeroProps) => {
  if (completed) {
    return (
      <div id="hero-signup-btm" className="mx-auto max-w-[1280px] px-cg-6 py-cg-10 max-[560px]:px-cg-4 max-[560px]:py-cg-6">
        <SignupComplete
          id="beta-signup"
          compact
          onReset={onReset}
          onOpenProfile={onOpenProfile}
          alreadyRegistered={alreadyRegistered}
          autoFocus={false}
        />
      </div>
    );
  }

  return (
  <div id="hero-signup-btm" className="max-w-[1280px] mx-auto px-cg-6 py-cg-10 [@media(width<=560px)]:px-cg-4 [@media(width<=560px)]:py-cg-6">
      <section className="py-14 px-cg-6 [background:radial-gradient(ellipse_at_95%_0%,color-mix(in_srgb,var(--landing-accent)_13.33%,transparent),transparent_40%),linear-gradient(120deg,var(--color-cg-brand),var(--landing-gradient-deep)_65%,var(--landing-gradient-end))] [@media(width<=560px)]:py-cg-10 [@media(width<=560px)]:px-cg-4 overflow-hidden rounded-cg-sm text-center text-cg-surface" aria-labelledby="beta-title">
        <h2 id="beta-title" className="text-cg-display-sm [@media(width<=560px)]:text-cg-heading-lg">베타, <span className="text-[var(--landing-accent)]">곧 열어요.</span></h2>
        <p className="text-[var(--landing-text-inverse)] text-cg-body-sm mt-cg-4 mx-auto mb-cg-8">먼저 써보고 싶다면 이메일을 남겨주세요. 오픈하면 가장 먼저 알려드릴게요.</p>
        <WaitlistEmailForm id="beta-signup" onRequestSignup={onRequestSignup} />
      </section>
  </div>
  );
};
export default LandingSignup;
