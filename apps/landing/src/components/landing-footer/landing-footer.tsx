"use client";

import Image from "next/image";
import { Button } from "@checkergie/ui";
import { Mail } from "lucide-react";

export interface LandingFooterProps {
  /** 이용약관 모달 열기. 클라이언트 컨테이너에서 LandingPage를 통해 전달 */
  onOpenTerms?: () => void;
  /** 개인정보처리방침 모달 열기 */
  onOpenPrivacy?: () => void;
}
const LandingFooter = ({ onOpenTerms, onOpenPrivacy }: LandingFooterProps) => (
  <footer className="bg-[var(--landing-footer-surface)] text-cg-text">
    <div className="max-w-[1440px] m-auto p-[calc(var(--spacing-cg-1)_*_7)_var(--spacing-cg-10)] [@media(width<=768px)]:p-cg-6">
      <div className="flex justify-between items-start gap-cg-6 pb-cg-6 [border-bottom:1px_solid_color-mix(in_srgb,_var(--color-cg-ink)_7.84%,_transparent)] [@media(width<=768px)]:flex-col [@media(width<=768px)]:items-start">
        <div className="flex items-start gap-cg-3 [&_img]:shrink-0 [&_strong]:text-cg-title-md [&_strong]:text-cg-ink">
          <Image src="/team-logo.svg" alt="" width={34} height={34} />
          <div>
            <p className="flex items-center gap-cg-3">
              <strong>팀 스터디움</strong>
              <span aria-hidden="true" className="h-[23px] w-px shrink-0 bg-cg-ink/20" />
              <span className="text-cg-label-sm">TEAM STUDIUM</span>
            </p>
            <p className="text-cg-caption-sm text-cg-text mt-cg-1">
              여러 플랫폼에 흩어진 강의를 한 곳에서 비교하고, 내 일정에 맞춘
              루틴으로 완강까지 관리하는 서비스입니다.
            </p>
          </div>
        </div>
        <nav aria-label="약관 안내" className="flex flex-wrap gap-cg-1">
          <Button
            variant="ghost"
            onClick={onOpenTerms}
            className="text-cg-text landing-brand-hover hover:bg-cg-subtle"
          >
            이용약관
          </Button>
          <Button
            variant="ghost"
            onClick={onOpenPrivacy}
            className="text-cg-text landing-brand-hover hover:bg-cg-subtle"
          >
            개인정보처리방침
          </Button>
        </nav>
      </div>
      <div className="[&_a:focus-visible]:[outline:2px_solid_var(--color-cg-brand)] [&_a:focus-visible]:outline-offset-[4px] flex items-center justify-between gap-cg-4 pt-cg-4 [&_small]:text-cg-caption-sm [&_a]:text-cg-label-sm [&_a]:inline-flex [&_a]:items-center [&_a]:gap-cg-2 [&_a]:[background:color-mix(in_srgb,_var(--color-cg-surface)_50.20%,_transparent)] [&_a]:rounded-cg-full [&_a]:p-[var(--spacing-cg-2)_calc(var(--spacing-cg-1)_*_3.5)] [@media(width<=768px)]:flex-col [@media(width<=768px)]:items-start">
        <small>© 2026 팀 스터디움(TEAM STUDIUM). All rights reserved.</small>
        <a href="mailto:pcentre@studium.rehab">
          <Mail size={14} aria-hidden="true" />
          pcentre@studium.rehab
        </a>
      </div>
    </div>
  </footer>
);
export default LandingFooter;
