"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@checkergie/ui";

export interface LandingHeaderProps {
  featuresHref?: string;
  routineHref?: string;
  signupHref?: string;
  completed?: boolean;
}

const LandingHeader = ({ featuresHref, routineHref, signupHref, completed = false }: LandingHeaderProps) => {
  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const measure = () => {
      document.documentElement.style.setProperty(
        "--landing-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--landing-header-height");
    };
  }, []);

  return <>
  <div aria-hidden="true" className="h-[var(--landing-header-height,112px)] shrink-0" />
  <header ref={headerRef} className="fixed inset-x-0 top-0 z-[var(--z-cg-sticky)] border-b border-cg-border bg-white/92">
    <div className="mx-auto flex min-h-24 max-w-[1440px] flex-wrap items-center justify-between gap-cg-4 px-cg-4 py-cg-6 sm:px-cg-10">
      <Link
        href="/"
        aria-label="체커기 홈"
        className="flex items-center gap-cg-3 rounded-cg-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cg-brand"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-cg-md">
          <Image src="/logo.svg" alt="" width={34} height={34} preload />
        </span>
        <span className="font-cg-sans flex shrink-0 flex-col text-cg-ink">
          <span className="text-cg-heading-lg">체커기</span>
          <span className="text-cg-label-sm">CHECKERGIE</span>
        </span>
      </Link>
      <nav aria-label="주요 메뉴" className="flex flex-wrap items-center gap-cg-1 sm:gap-cg-4">
        <Button<"a"> href={featuresHref} variant="ghost" className="landing-brand-hover hover:bg-cg-subtle">강의 찾기</Button>
        <Button<"a"> href={routineHref} variant="ghost" className="landing-brand-hover hover:bg-cg-subtle">루틴화</Button>
        <Button<"a">
          href={signupHref}
          trailingIcon={completed ? <Check size={20} /> : undefined}
          className={completed
            ? "border border-[var(--landing-accent)]/50 [&&]:bg-[var(--landing-accent)]/15 [&&]:text-[var(--landing-accent)] [&&]:hover:bg-[var(--landing-accent)]/25 [&&]:hover:text-[var(--landing-accent)]"
            : "[&&]:hover:bg-cg-action [&&]:hover:text-cg-ink motion-safe:hover:-translate-y-px hover:shadow-[0_8px_18px_rgba(255,200,87,0.42)]"}
        >{completed ? "신청 완료" : "베타 대기"}</Button>
      </nav>
    </div>
  </header>
  </>;
};

export default LandingHeader;
