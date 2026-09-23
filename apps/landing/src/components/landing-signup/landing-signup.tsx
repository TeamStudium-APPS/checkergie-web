"use client";

import { Bell, Check } from "lucide-react";
import EmailSignupForm from "./email-signup-form";
import type { LandingHeroProps } from "../landing-hero/landing-hero";
import styles from "./landing-signup.module.css";

const LandingSignup = ({ completed, onRequestSignup }: LandingHeroProps) => (
  <div id="hero-signup-btm" className={`${styles.container} mx-auto px-cg-6 py-cg-10 [@media(width<=560px)]:px-cg-4 [@media(width<=560px)]:py-cg-6`}>
    {completed ? (
      <section
        id="beta-signup"
        className={`${styles.completeSection} overflow-hidden rounded-cg-sm text-cg-surface`}
        aria-labelledby="beta-complete-title"
      >
        <div className={styles.completeContent}>
          <h2 id="beta-complete-title" className={`${styles.completeTitle} text-cg-title-md flex items-center gap-cg-3 px-cg-5 py-cg-4 rounded-cg-full`}>
            <Check size={24} aria-hidden="true" className={`${styles.completeIcon} shrink-0 p-cg-1 rounded-full`} />
            정상적으로 등록됐어요!
          </h2>
          <div className={`${styles.benefits} mt-cg-4 p-cg-6 rounded-cg-lg [@media(width<=560px)]:p-cg-4`}>
            <p className={`${styles.benefitsTitle} text-cg-label-md flex items-center gap-cg-2 mb-cg-6`}>
              <Bell size={16} aria-hidden="true" />대기 등록 완료
            </p>
            <ul className="grid gap-cg-5">
              {[
                ["오픈 알림", "오픈일에 등록하신 메일로 보내드려요"],
                ["우선 초대", "대기 순번대로 베타에 초대해요"],
                ["같이 완강", "친구에게 알려주면 함께 시작할 수 있어요"],
              ].map(([title, text]) => (
                <li key={title} className={`${styles.benefit} text-cg-body-sm flex items-baseline gap-cg-3 [@media(width<=560px)]:flex-wrap [@media(width<=560px)]:gap-cg-2`}>
                  <Check size={18} aria-hidden="true" className={`${styles.benefitIcon} self-center shrink-0 rounded-full`} />
                  <strong className="whitespace-nowrap text-cg-surface">{title}</strong>
                  <span>— {text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    ) : (
      <section className={`${styles.signupSection} overflow-hidden rounded-cg-sm text-center text-cg-surface`} aria-labelledby="beta-title">
        <h2 id="beta-title" className="text-cg-display-sm [@media(width<=560px)]:text-cg-heading-lg">베타, <span className={styles.accent}>곧 열어요.</span></h2>
        <p className={`${styles.description} text-cg-body-sm mt-cg-4 mx-auto mb-cg-8`}>먼저 써보고 싶다면 이메일을 남겨주세요. 오픈하면 가장 먼저 알려드릴게요.</p>
        <EmailSignupForm id="beta-signup" onRequestSignup={onRequestSignup} />
      </section>
    )}
  </div>
);
export default LandingSignup;
