"use client";

import type { ReactNode } from "react";
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

const NavigationButton = ({ href, ...props }: {
  href?: string;
  children: ReactNode;
  className?: string;
  variant?: "ghost";
  trailingIcon?: ReactNode;
}) => href ? <Button as="a" href={href} {...props} /> : <Button {...props} />;

const LandingHeader = ({ featuresHref, routineHref, signupHref, completed = false }: LandingHeaderProps) => (
  <header className="sticky top-0 z-cg-sticky border-b border-cg-border bg-cg-surface">
    <div className="mx-auto flex min-h-24 max-w-[1440px] flex-wrap items-center justify-between gap-cg-4 px-cg-4 py-cg-6 sm:px-cg-10">
      <Link
        href="/"
        aria-label="체커기 홈"
        className="flex items-center gap-cg-3 rounded-cg-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cg-brand"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-cg-md">
          <span className="grid w-[34px] h-[34px]" aria-hidden="true">
            <Image className="[grid-area:1/1] [animation:logo-color-swap_1000ms_var(--ease-cg-standard)_both] [--logo-final-opacity:1] [--logo-initial-opacity:0] motion-reduce:[animation:none]" src="/logo.svg" alt="" width={34} height={34} preload />
            <Image className="[grid-area:1/1] [animation:logo-color-swap_1000ms_var(--ease-cg-standard)_both] [--logo-final-opacity:0] [--logo-initial-opacity:1] opacity-0 motion-reduce:[animation:none]" src="/logo-reversed.svg" alt="" width={34} height={34} preload />
          </span>
        </span>
        <span className="font-cg-sans flex shrink-0 flex-col text-cg-ink">
          <span className="text-cg-heading-lg">체커기</span>
          <span className="text-cg-label-sm">CHECKERGIE</span>
        </span>
      </Link>
      <nav aria-label="주요 메뉴" className="flex flex-wrap items-center gap-cg-1 sm:gap-cg-4">
        <NavigationButton href={featuresHref} variant="ghost" className="landing-brand-hover hover:bg-cg-subtle">강의 찾기</NavigationButton>
        <NavigationButton href={routineHref} variant="ghost" className="landing-brand-hover hover:bg-cg-subtle">루틴화</NavigationButton>
        <NavigationButton
          href={signupHref}
          trailingIcon={completed ? <Check size={20} /> : undefined}
          className={completed
            ? "border border-[var(--landing-accent)]/50 [&&]:bg-[var(--landing-accent)]/15 [&&]:text-[var(--landing-accent)] [&&]:hover:bg-[var(--landing-accent)]/25 [&&]:hover:text-[var(--landing-accent)]"
            : "hover:bg-cg-subtle landing-brand-hover"}
        >{completed ? "신청 완료" : "베타 대기"}</NavigationButton>
      </nav>
    </div>
  </header>
);

export default LandingHeader;
