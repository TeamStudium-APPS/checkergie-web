import { ChevronDown, Sparkles, UserRoundCog } from "lucide-react";

// TODO: select 옵션 값은 추후 논의 후 확정. 현재는 기존 노출값만 옵션으로 둔다.
const fields = [
  { label: "목표", value: "토익 700" },
  { label: "수준", value: "난이도 2~3" },
  { label: "시간", value: "평일 저녁 40분" },
  { label: "기간", value: "3개월" },
];

const CurationCard = () => (
  <article className="bg-cg-surface border border-cg-border rounded-cg-md p-cg-6 shadow-cg-sm hover:shadow-cg-card hover:-translate-y-0.5 transition-[transform,box-shadow] duration-cg-base motion-reduce:transition-none flex flex-col">
    <div className="flex items-center gap-cg-3 mb-cg-3">
      <UserRoundCog size={22} className="text-cg-ink" aria-hidden="true" />
      <h3 className="text-cg-title-lg text-cg-ink">개인 큐레이션</h3>
    </div>
    <p className="text-cg-body-sm text-cg-text">
      목표·현재 수준·가능한 시간만 넣으면, 나에게 맞는 강의를 골라서 추천해드려요.
    </p>
    <div className="flex-1 flex flex-col justify-between gap-cg-2 mt-cg-4">
      {fields.map((field) => (
        <div key={field.label} className="flex items-center gap-cg-2 text-cg-label-sm">
          <label htmlFor={`curation-${field.label}`} className="w-12 shrink-0 text-cg-caption">
            {field.label}
          </label>
          <div className="relative flex-1">
            <select
              id={`curation-${field.label}`}
              defaultValue={field.value}
              className="w-full h-[38px] appearance-none cursor-pointer bg-cg-subtle border border-cg-border rounded-cg-xs pl-cg-3 pr-cg-8 font-cg-semibold text-cg-ink outline-none focus-visible:ring-2 focus-visible:ring-cg-brand/20"
            >
              <option value={field.value}>{field.value}</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-cg-3 top-1/2 -translate-y-1/2 text-cg-muted"
              aria-hidden="true"
            />
          </div>
        </div>
      ))}
    </div>
    <div className="h-11 flex items-center justify-center gap-cg-2 text-cg-label-sm font-cg-bold text-cg-brand bg-cg-brand-soft rounded-cg-md px-cg-4 mt-cg-4">
      <Sparkles size={14} aria-hidden="true" />
      나에게 맞는 강의 6개를 찾았어요
    </div>
  </article>
);

export default CurationCard;
