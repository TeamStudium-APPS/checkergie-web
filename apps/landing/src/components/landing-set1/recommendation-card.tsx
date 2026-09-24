import { Check, ChevronDown, Sparkles } from "lucide-react";

const recommendations = [
  { rank: 1, title: "한 달 완성 토익 RC 실전 패키지", why: "평일 저녁 40분 · 난이도 3", score: "6.2" },
  { rank: 2, title: "기초부터 다지는 LC 청취 훈련", why: "하루 35분 · 난이도 2", score: "5.8" },
  { rank: 3, title: "직장인 새벽 30분 영단어 루틴", why: "하루 25분 · 난이도 1", score: "5.1" },
];

const RecommendationCard = () => (
  <article className="bg-cg-surface border border-cg-border rounded-cg-md p-cg-6 shadow-cg-sm hover:shadow-cg-card hover:-translate-y-0.5 transition-[transform,box-shadow] duration-cg-base motion-reduce:transition-none flex flex-col">
    <div className="flex items-center gap-cg-3 mb-cg-3">
      <Sparkles size={22} className="text-cg-ink" aria-hidden="true" />
      <h3 className="text-cg-title-lg text-cg-ink">추천 결과</h3>
    </div>
    <p className="text-cg-body-sm text-cg-text">
      찾은 강의를 조건에 잘 맞는 순서로 세워드려요. 왜 골랐는지 이유까지 함께요.
    </p>
    <div className="grid gap-cg-2 mt-cg-4">
      {recommendations.map((item) => (
        <div
          key={item.rank}
          className="flex items-center gap-cg-3 bg-cg-subtle border border-cg-border rounded-cg-md px-cg-3 py-cg-2"
        >
          <span className="size-[18px] shrink-0 grid place-items-center rounded-cg-full bg-cg-border text-cg-caption-sm font-cg-bold text-cg-text">
            {item.rank}
          </span>
          <div className="flex-1 min-w-0">
            <strong className="block text-cg-body-sm font-cg-bold text-cg-ink truncate">
              {item.title}
            </strong>
            <span className="flex items-center gap-cg-1 text-cg-caption-sm text-cg-muted">
              <Check size={11} aria-hidden="true" />
              {item.why}
            </span>
          </div>
          <span className="shrink-0 text-cg-body-md font-cg-bold text-cg-ink">
            {item.score}
            <i className="not-italic text-cg-caption-sm font-cg-medium text-cg-muted ml-0.5">/7</i>
          </span>
        </div>
      ))}
    </div>
    <div className="h-11 flex items-center justify-center gap-cg-2 text-cg-label-sm text-cg-muted border border-dashed border-cg-border-strong rounded-cg-md px-cg-4 mt-cg-4">
      <ChevronDown size={12} aria-hidden="true" />
      조건에 맞는 강의 3개 더 보기
    </div>
  </article>
);

export default RecommendationCard;
