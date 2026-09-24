"use client";

import { useLayoutEffect, useRef } from "react";
import { Check, ChevronsDown } from "lucide-react";
import EmailSignupForm from "../landing-signup/email-signup-form";
import SignupComplete from "./signup-complete";
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
  profileSaved = false,
  onRequestSignup,
  onReset,
  onOpenProfile,
}: LandingHeroProps) => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = root.current;
    if (!section) return;
    const header = document.querySelector("header");
    const copy = section.querySelector<HTMLElement>("[data-hero-copy]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia(
      "(min-width: 1024px) and (min-height: 700px)",
    );
    let frame = 0;
    let headerHeight = 112;
    let distance = 1;

    const measure = () => {
      if (copy)
        section.style.setProperty(
          "--hero-copy-height",
          `${copy.offsetHeight}px`,
        );
      headerHeight = header?.getBoundingClientRect().height ?? 112;

      distance = Math.max(
        1,
        section.offsetHeight - (window.innerHeight - headerHeight),
      );
    };

    const update = () => {
      frame = 0;

      const sectionTop = section.getBoundingClientRect().top;

      const progress =
        !reduce.matches && desktop.matches
          ? Math.min(1, Math.max(0, (headerHeight - sectionTop) / distance))
          : 0;

      const travel = 1 - Math.pow(1 - progress, 3);

      section.style.setProperty("--hero-progress", String(progress));
      section.style.setProperty("--hero-travel", String(travel));

      if (copy) copy.inert = travel >= 0.5;
      section.dataset.previewReady = "true";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      update();
    };
    const observer = new ResizeObserver(remeasure);
    if (header) observer.observe(header);
    if (copy) observer.observe(copy);
    observer.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    reduce.addEventListener("change", remeasure);
    desktop.addEventListener("change", remeasure);
    measure();
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      delete section.dataset.previewReady;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      reduce.removeEventListener("change", remeasure);
      desktop.removeEventListener("change", remeasure);
    };
  }, [completed]);

  if (completed)
    return (
      <SignupComplete
        onReset={onReset}
        onOpenProfile={onOpenProfile}
        profileSaved={profileSaved}
        autoFocus={false}
      />
    );

  return (
    <section
      ref={root}
      className="group/hero [--landing-glow:#3030d6] [--hero-progress:0] [--hero-travel:0] [--hero-ink:var(--landing-backdrop)] [--hero-mint:var(--landing-accent)] bg-[var(--hero-ink)] hero-motion:h-[calc(180svh_-_var(--landing-header-height,112px))] relative text-cg-surface"
      aria-labelledby="hero-title"
    >
      <div className="relative min-h-[calc(100svh_-_var(--landing-header-height,112px))] [background:radial-gradient(ellipse_at_80%_25%,color-mix(in_srgb,var(--landing-glow)_13.33%,transparent),transparent_65%)] hero-motion:sticky hero-motion:top-[var(--landing-header-height,112px)] hero-motion:h-[calc(100svh_-_var(--landing-header-height,112px))] overflow-clip">
        <div className="w-full max-w-[1440px] grid grid-cols-[0.9fr_1.1fr] min-h-[inherit] py-cg-16 px-cg-10 gap-cg-12 hero-motion:block hero-motion:h-full hero-motion:min-h-0 hero-motion:pt-9 hero-motion:pb-cg-12 [@media(width<=1023px)]:grid-cols-1 [@media(width<=1023px)]:py-cg-12 [@media(width<=1023px)]:px-cg-6 [@media(width<=1023px)]:gap-cg-10 [@media(width<=560px)]:py-9 [@media(width<=560px)]:px-cg-4 relative m-auto items-center">
          <div
            className="[&_em]:text-[var(--hero-mint)] [&_em]:not-italic hero-motion:absolute hero-motion:top-1/2 hero-motion:w-[43%] hero-motion:opacity-[max(0,calc(1_-_var(--hero-travel)*2))] hero-motion:[transform:translateY(calc(-50%_-_var(--hero-travel)*64px))] [@media(width<=1023px)]:w-full [@media(width<=1023px)]:max-w-[620px] [@media(width<=1023px)]:mx-auto min-w-0"
            data-hero-copy
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
            <div className="mt-cg-6 p-cg-6 border border-cg-surface/[0.149] rounded-cg-lg bg-cg-surface/[0.0196] [&>p]:mb-[18px] [&>p]:text-[var(--landing-text-inverse-muted)] [&_ul]:grid [&_ul]:gap-cg-4 [&_li]:flex [&_li]:items-baseline [&_li]:gap-cg-3 [&_li]:text-[var(--landing-text-inverse)] [&_li>span:first-child]:px-[5px] [&_li>span:first-child]:text-[var(--hero-mint)] [&_li>span:first-child]:bg-[var(--landing-accent)]/[0.1333] [&_li>span:first-child]:rounded-cg-full [&_strong]:text-cg-surface [&_strong]:whitespace-nowrap [@media(width<=560px)]:p-cg-4 [@media(width<=560px)]:[&_li]:flex-wrap [@media(width<=560px)]:[&_li]:gap-cg-2">
              <p className="text-cg-label-md">지금 등록하면</p>
              <ul>
                {[
                  ["먼저 알림", "정식 오픈하는 날, 메일로 가장 먼저"],
                  ["우선 초대", "베타는 대기 순번대로 초대해요"],
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
            className="min-w-0 z-[1] lg:invisible lg:group-data-[preview-ready=true]/hero:visible hero-motion:absolute hero-motion:left-[calc(74.5%_-_20px_-_(24.5%_-_20px)*var(--hero-travel))] hero-motion:w-[calc(51%_+_(49%_-_80px)*var(--hero-travel))] hero-motion:[transform:translateX(-50%)] hero-motion:will-change-[transform,width,left] hero-motion:top-[max(var(--spacing-cg-6),calc(50%_-_var(--hero-copy-height,0px)/2_-_var(--spacing-cg-6)))] hero-motion:bottom-[max(0px,calc(50%_-_var(--hero-copy-height,0px)/2))] hero-static:absolute hero-static:top-[max(var(--spacing-cg-6),calc(50%_-_var(--hero-copy-height,0px)/2_-_var(--spacing-cg-6)))] hero-static:right-cg-10 hero-static:bottom-[max(0px,calc(50%_-_var(--hero-copy-height,0px)/2))] hero-static:w-[calc((100%_-_var(--spacing-cg-10)*2_-_var(--spacing-cg-12))*0.55)]"
          >
            <BrowserPreview />
          </div>
        </div>
        <span
          className="absolute bottom-cg-5 left-1/2 z-10 grid justify-items-center pointer-events-none opacity-[max(0,calc(1_-_var(--hero-progress)*4))] [transform:translateX(-50%)] animate-[landing-hero-float_1s_ease-in-out_infinite] [@media(width<=1023px)]:hidden motion-reduce:hidden"
          aria-hidden="true"
        >
          <ChevronsDown size={28} />
        </span>
      </div>
    </section>
  );
};

export default LandingHero;
