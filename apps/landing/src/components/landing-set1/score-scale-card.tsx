import { ShieldCheck, Star } from "lucide-react";

const scale = [1, 2, 3, 4, 5, 6, 7];

export interface ScoreScaleCardProps {
  className?: string;
}

const ScoreScaleCard = ({ className = "" }: ScoreScaleCardProps) => (
  <article
    className={`bg-[linear-gradient(135deg,var(--color-cg-brand)_0%,var(--color-cg-brand-hover)_60%,#170d49_100%)] text-cg-surface rounded-cg-md p-cg-6 shadow-cg-card hover:shadow-cg-float hover:-translate-y-0.5 transition-[transform,box-shadow] duration-cg-base motion-reduce:transition-none flex flex-col ${className}`}
  >
    <div className="flex items-center gap-cg-3 mb-cg-3">
      <Star size={22} aria-hidden="true" />
      <h3 className="text-cg-title-lg">7점제 평점</h3>
    </div>
    <p className="text-cg-body-sm text-[var(--landing-text-inverse)]">
      5점 만점 별점은 금방 4.8점이 됩니다. 체커기는 7점 척도로 촘촘하게, 인플레이션 없이 정량 평가해요.
    </p>
    <div className="grid grid-cols-7 gap-cg-2 mt-cg-5">
      {scale.map((value) => (
        <span
          key={value}
          data-active={value === 6}
          className="h-9 grid place-items-center rounded-cg-sm bg-cg-surface/10 border border-cg-surface/[0.16] text-cg-label-sm text-[var(--landing-text-inverse-muted)] data-[active=true]:bg-[var(--color-cg-action)] data-[active=true]:border-[var(--color-cg-action)] data-[active=true]:text-cg-ink"
        >
          {value}
        </span>
      ))}
    </div>
    <div className="flex justify-between text-cg-caption-sm text-[var(--landing-text-inverse-muted)] mt-cg-3">
      <span>1 · 비추천</span>
      <span>4 · 보통</span>
      <span>7 · 인생 강의</span>
    </div>
    <div className="flex items-center gap-cg-2 text-cg-label-sm text-cg-surface bg-cg-surface/10 rounded-cg-md px-cg-3 py-cg-3 mt-cg-4">
      <ShieldCheck size={14} aria-hidden="true" className="shrink-0" />
      상·하위 10% 극단값은 평균에서 제외합니다
    </div>
  </article>
);

export default ScoreScaleCard;
