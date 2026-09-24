import { Info } from "lucide-react";
import ScheduleCard from "./schedule-card";
import ReviewCard from "./review-card";
import GamificationCard from "./gamification-card";

const LandingSet2 = () => (
  <section
    id="set2"
    className="[scroll-margin-top:var(--landing-header-height,112px)] max-w-[1280px] mx-auto px-cg-6 [@media(width<=560px)]:px-cg-4"
    aria-labelledby="set2-title"
  >
    <div className="bg-cg-subtle border border-cg-border rounded-cg-md p-cg-10 grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-cg-10 [@media(width<=1023px)]:p-cg-6">
      <div className="lg:sticky lg:top-[calc(var(--landing-header-height,112px)+var(--spacing-cg-6))] self-start">
        <span className="inline-flex items-center gap-cg-2 text-cg-label-md text-cg-muted mb-cg-4">
          Set 2 · 루틴화
          <span className="text-cg-caption-sm text-cg-muted bg-cg-surface border border-cg-border rounded-cg-full px-cg-2 py-0.5">
            준비 중
          </span>
        </span>
        <h2
          id="set2-title"
          className="text-cg-heading-lg text-cg-ink [&_em]:not-italic [&_em]:text-cg-brand"
        >
          결제하고 끝나지 않게,
          <br />
          <em>완강까지 루틴으로</em>
        </h2>
        <p className="text-cg-body-sm text-cg-text mt-cg-4">
          강의를 내 일정에 맞게 잘게 쪼개고, 복습과 게임화로 끝까지 가는 흐름을 만들어요.
        </p>
        <div className="flex items-start gap-cg-2 text-cg-label-sm text-cg-muted mt-cg-5 pt-cg-4 border-t border-cg-border">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>루틴 기능은 베타에서 순차적으로 열립니다.</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-cg-4">
        <ScheduleCard />
        <ReviewCard />
        <GamificationCard />
      </div>
    </div>
  </section>
);

export default LandingSet2;
