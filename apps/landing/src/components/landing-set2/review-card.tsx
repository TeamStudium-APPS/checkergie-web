import { Fragment } from "react";
import { ChevronRight, Repeat } from "lucide-react";

const cycle = [
  { label: "1일", active: true },
  { label: "3일", active: true },
  { label: "7일", active: false },
  { label: "14일", active: false },
];

const ReviewCard = () => (
  <article className="bg-cg-surface border border-cg-border rounded-cg-md p-cg-6 shadow-cg-sm hover:shadow-cg-card hover:-translate-y-0.5 transition-[transform,box-shadow] duration-cg-base motion-reduce:transition-none flex flex-col">
    <div className="flex items-center gap-cg-3 mb-cg-3">
      <Repeat size={22} className="text-cg-ink" aria-hidden="true" />
      <h3 className="text-cg-title-lg text-cg-ink">복습 제공</h3>
    </div>
    <p className="text-cg-body-sm text-cg-text flex-1">
      배운 내용을 잊을 때쯤 다시 꺼내드려요. 복습 주기와 방식은 베타에서 함께 다듬어갑니다.
    </p>
    <div className="flex flex-nowrap items-center gap-cg-1 mt-cg-4">
      {cycle.map((step, index) => (
        <Fragment key={step.label}>
          <span
            className={
              step.active
                ? "flex-1 min-w-0 h-7 grid place-items-center rounded-cg-xs bg-cg-success-soft text-cg-success text-cg-label-sm font-cg-bold"
                : "flex-1 min-w-0 h-7 grid place-items-center rounded-cg-xs bg-cg-subtle text-cg-muted text-cg-label-sm font-cg-bold"
            }
          >
            {step.label}
          </span>
          {index < cycle.length - 1 && (
            <ChevronRight size={12} className="text-cg-caption shrink-0" aria-hidden="true" />
          )}
        </Fragment>
      ))}
    </div>
    <div className="flex justify-between text-cg-caption-sm text-cg-muted mt-cg-4">
      <span>3강 복습 예정</span>
      <span>내일 오전</span>
    </div>
  </article>
);

export default ReviewCard;
