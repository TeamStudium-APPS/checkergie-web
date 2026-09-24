import { Flame, Gamepad2, Lock, Medal, Target } from "lucide-react";

const badges = [
  { icon: Flame, earned: true },
  { icon: Medal, earned: true },
  { icon: Target, earned: true },
  { icon: Lock, earned: false },
];

const streak = Array.from({ length: 14 }, (_, index) => index < 12);

const GamificationCard = () => (
  <article className="bg-cg-surface border border-cg-border rounded-cg-md p-cg-6 shadow-cg-sm hover:shadow-cg-card hover:-translate-y-0.5 transition-[transform,box-shadow] duration-cg-base motion-reduce:transition-none flex flex-col">
    <div className="flex items-center gap-cg-3 mb-cg-3">
      <Gamepad2 size={22} className="text-cg-ink" aria-hidden="true" />
      <h3 className="text-cg-title-lg text-cg-ink">게임화 루틴</h3>
    </div>
    <p className="text-cg-body-sm text-cg-text flex-1">
      스트릭·뱃지·완주 인증으로 오늘 하루치를 계속 누르게 만들어요. 꾸준함이 곧 완강입니다.
    </p>
    <div className="flex gap-cg-2 mt-cg-4">
      {badges.map(({ icon: Icon, earned }, index) => (
        <span
          key={index}
          className={
            earned
              ? "size-9 grid place-items-center rounded-cg-full bg-[linear-gradient(135deg,var(--landing-gold)_0%,var(--landing-coral)_100%)] text-cg-surface"
              : "size-9 grid place-items-center rounded-cg-full bg-cg-subtle border border-cg-border text-cg-muted"
          }
        >
          <Icon size={17} aria-hidden="true" />
        </span>
      ))}
    </div>
    <div className="flex gap-cg-1 mt-cg-3">
      {streak.map((on, index) => (
        <i
          key={index}
          className={`flex-1 h-2 rounded-cg-xs not-italic ${on ? "bg-[var(--landing-coral)]" : "bg-cg-border"}`}
        />
      ))}
    </div>
    <div className="flex justify-between text-cg-caption-sm text-cg-muted mt-cg-3">
      <span>연속 12일 학습 중</span>
      <span>완주 뱃지 3/4</span>
    </div>
  </article>
);

export default GamificationCard;
