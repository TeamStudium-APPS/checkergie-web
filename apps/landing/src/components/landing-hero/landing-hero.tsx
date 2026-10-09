"use client";

import { Bell, Check, ChevronsDown, Gift } from "lucide-react";
import EmailSignupForm from "../landing-signup/email-signup-form";
import BrowserPreview from "./browser-preview";

export interface LandingHeroProps {
  completed?: boolean;
  profileSaved?: boolean;
  onRequestSignup?: (email: string) => void | Promise<void>;
  onReset?: () => void;
  onOpenProfile?: () => void;
}

const LandingHero = ({
  completed = false,
  onRequestSignup,
}: LandingHeroProps) => {
  if (completed) {
    return (
      <section
        id="hero-signup"
        className="bg-[var(--landing-backdrop)] [scroll-margin-top:calc(var(--landing-header-height,112px)_+_var(--spacing-cg-6))] text-cg-surface"
        aria-labelledby="hero-complete-title"
      >
        <div className="mx-auto max-w-[1280px] px-cg-10 py-14 max-[560px]:px-cg-4 max-[560px]:py-cg-8">
        <div className="max-w-[560px]">
          <h1 id="hero-complete-title" className="border border-[var(--landing-accent)]/40 text-[var(--landing-accent)] bg-[var(--landing-accent)]/[0.1333] text-cg-title-md flex items-center gap-cg-3 px-cg-5 py-cg-4 rounded-cg-full">
            <Check size={24} aria-hidden="true" className="bg-[var(--landing-accent)] text-[var(--landing-on-accent)] shrink-0 p-cg-1 rounded-full" />
            정상적으로 등록됐어요!
          </h1>
          <div className="border border-cg-surface/[0.149] bg-cg-surface/[0.0196] mt-cg-4 p-cg-6 rounded-cg-lg [@media(width<=560px)]:p-cg-4">
            <p className="text-[var(--landing-text-inverse-muted)] text-cg-label-md flex items-center gap-cg-2 mb-cg-6">
              <Bell size={16} aria-hidden="true" />대기 등록 완료
            </p>
            <ul className="grid gap-cg-5">
              {[
                ["오픈 알림", "오픈일에 등록하신 메일로 보내드려요"],
                ["맞춤 추천", "연령대·성별을 알려주시면 강의 추천을 준비하는 데 참고할게요"],
                ["같이 완강", "친구에게 알려주면 함께 시작할 수 있어요"],
              ].map(([title, text]) => (
                <li key={title} className="text-[var(--landing-text-inverse)] text-cg-body-sm flex items-baseline gap-cg-3 [@media(width<=560px)]:flex-wrap [@media(width<=560px)]:gap-cg-2">
                  <Check size={18} aria-hidden="true" className="p-0.5 text-[var(--landing-accent)] bg-[var(--landing-accent)]/[0.1333] self-center shrink-0 rounded-full" />
                  <strong className="whitespace-nowrap text-cg-surface">{title}</strong>
                  <span>— {text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="[--landing-glow:#3030d6] [--hero-ink:var(--landing-backdrop)] [--hero-mint:var(--landing-accent)] bg-[var(--hero-ink)] relative text-cg-surface"
      aria-labelledby="hero-title"
    >
      <div className="relative min-h-[calc(100svh_-_var(--landing-header-height,112px))] [background:radial-gradient(ellipse_at_80%_25%,color-mix(in_srgb,var(--landing-glow)_13.33%,transparent),transparent_65%)] overflow-clip">
        <div className="relative mx-auto grid w-full max-w-[1440px] min-h-[inherit] grid-cols-[0.9fr_1.1fr] items-center gap-cg-12 px-cg-10 py-cg-16 max-lg:grid-cols-1 max-lg:gap-cg-10 max-lg:px-cg-6 max-lg:py-cg-12 max-[560px]:px-cg-4 max-[560px]:py-9">
          <div
            className="min-w-0 [&_em]:text-[var(--hero-mint)] [&_em]:not-italic max-lg:mx-auto max-lg:w-full max-lg:max-w-[620px]"
          >
            <h1 id="hero-title" className="text-cg-display-lg max-[560px]:text-cg-display-sm">
              고민은 <em>짧</em>게,
              <br />
              강의 수강은 <em>끝</em>까지.
            </h1>
            <p className="text-[var(--landing-text-inverse)] text-cg-body-lg mt-cg-6 mb-cg-6 max-[560px]:text-cg-body-sm">
              여러 플랫폼에 흩어진 강의를 한 곳에서 비교하고,
              <br />
              검증된 후기로 진짜 강의 상태를 확인하세요.
            </p>
            <EmailSignupForm
              id="hero-signup"
              align="left"
              onRequestSignup={onRequestSignup}
            />
            <div className="mt-cg-6 p-cg-6 border border-cg-surface/[0.149] rounded-cg-lg bg-cg-surface/[0.0196] [&>p]:mb-[18px] [&>p]:text-[var(--landing-text-inverse-muted)] [&_ul]:grid [&_ul]:gap-cg-4 [&_li]:flex [&_li]:items-baseline [&_li]:gap-cg-3 [&_li]:text-[var(--landing-text-inverse)] [&_li>span:first-child]:size-cg-6 [&_li>span:first-child]:shrink-0 [&_li>span:first-child]:inline-grid [&_li>span:first-child]:place-items-center [&_li>span:first-child]:self-center [&_li>span:first-child]:text-[var(--hero-mint)] [&_li>span:first-child]:bg-[var(--landing-accent)]/[0.1333] [&_li>span:first-child]:rounded-cg-full [&_strong]:text-cg-surface [&_strong]:whitespace-nowrap [@media(width<=560px)]:p-cg-4 [@media(width<=560px)]:[&_li]:flex-wrap [@media(width<=560px)]:[&_li]:gap-cg-2">
              <p className="text-cg-label-md flex items-center gap-cg-2"><Gift size={16} className="shrink-0" aria-hidden="true" />지금 등록하면</p>
              <ul>
                {[
                  ["먼저 알림", "정식 오픈하는 날, 메일로 가장 먼저"],
                  ["맞춤 추천", "연령대·성별을 알려주시면 강의 추천을 준비하는 데 참고할게요"],
                  ["순번 확인", "등록 즉시 내 대기 번호를 알려드려요"],
                ].map(([title, text]) => (
                  <li key={title}>
                    <span aria-hidden="true">
                      <Check size={16} />
                    </span>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className="relative min-w-0 lg:self-stretch"
          >
            <div className="lg:absolute lg:inset-x-0 lg:bottom-0 lg:-top-cg-6">
              <BrowserPreview />
            </div>
          </div>
        </div>
        <span
          className="absolute bottom-cg-5 left-1/2 z-10 grid -translate-x-1/2 justify-items-center pointer-events-none animate-[landing-hero-float_1s_ease-in-out_infinite] max-lg:hidden motion-reduce:hidden"
          aria-hidden="true"
        >
          <ChevronsDown size={28} />
        </span>
      </div>
    </section>
  );
};

export default LandingHero;
