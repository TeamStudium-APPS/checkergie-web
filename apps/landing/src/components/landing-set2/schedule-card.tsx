import { CalendarClock } from "lucide-react";

const week = [
  { day: "월", state: "done" as const },
  { day: "화", state: "done" as const },
  { day: "수", state: "on" as const },
  { day: "목", state: "on" as const },
  { day: "금", state: "idle" as const },
  { day: "토", state: "idle" as const },
  { day: "일", state: "idle" as const },
];

const weekStateClass = {
  done: "bg-cg-brand text-cg-surface",
  on: "bg-cg-brand-soft text-cg-brand",
  idle: "bg-cg-subtle text-cg-muted",
};

const slices = [true, true, true, false, false, false, false, false];

const ScheduleCard = () => (
  <article className="bg-cg-surface border border-cg-border rounded-cg-md p-cg-6 shadow-cg-sm hover:shadow-cg-card hover:-translate-y-0.5 transition-[transform,box-shadow] duration-cg-base motion-reduce:transition-none flex flex-col">
    <div className="flex items-center gap-cg-3 mb-cg-3">
      <CalendarClock size={22} className="text-cg-ink" aria-hidden="true" />
      <h3 className="text-cg-title-lg text-cg-ink">강의 미분화</h3>
    </div>
    <p className="text-cg-body-sm text-cg-text flex-1">
      18시간짜리 강의를 내 시간표에 맞춰 40분 단위로 쪼개고, 날짜별 일정으로 배치해드려요.
    </p>
    <div className="grid grid-cols-7 gap-cg-1 mt-cg-4">
      {week.map(({ day, state }) => (
        <span
          key={day}
          className={`h-8 grid place-items-center rounded-cg-xs text-cg-caption-sm font-cg-bold ${weekStateClass[state]}`}
        >
          {day}
        </span>
      ))}
    </div>
    <div className="flex gap-cg-1 mt-cg-2">
      {slices.map((on, index) => (
        <i
          key={index}
          className={`flex-1 h-1.5 rounded-cg-full not-italic ${on ? "bg-cg-brand" : "bg-cg-brand-soft"}`}
        />
      ))}
    </div>
    <div className="flex justify-between text-cg-caption-sm text-cg-muted mt-cg-3">
      <span>18시간 → 27회차</span>
      <span>D-18</span>
    </div>
  </article>
);

export default ScheduleCard;
