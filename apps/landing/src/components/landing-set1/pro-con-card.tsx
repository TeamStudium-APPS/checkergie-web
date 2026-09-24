import { MessageCircleWarning, MessageSquareQuote, ThumbsUp } from "lucide-react";

const proCon = [
  { type: "pro" as const, text: "개념 설명이 친절하고 예시가 많아요" },
  { type: "pro" as const, text: "제공 자료만으로 복습이 돼요" },
  { type: "con" as const, text: "후반부 진도가 빠른 편이에요" },
];

const wordCloud = [
  { word: "친절한설명", size: "text-cg-body-lg", color: "text-cg-ink" },
  { word: "자료충실", size: "text-cg-body-sm", color: "text-cg-text" },
  { word: "예제많음", size: "text-cg-body-lg", color: "text-cg-ink" },
  { word: "진도빠름", size: "text-cg-caption-sm", color: "text-cg-caption" },
  { word: "복습용", size: "text-cg-body-sm", color: "text-cg-text" },
  { word: "음질", size: "text-cg-caption-sm", color: "text-cg-caption" },
];

const ProConCard = () => (
  <article className="bg-cg-surface border border-cg-border rounded-cg-md p-cg-6 shadow-cg-sm hover:shadow-cg-card hover:-translate-y-0.5 transition-[transform,box-shadow] duration-cg-base motion-reduce:transition-none flex flex-col">
    <div className="flex items-center gap-cg-3 mb-cg-3">
      <MessageSquareQuote size={22} className="text-cg-ink" aria-hidden="true" />
      <h3 className="text-cg-title-lg text-cg-ink">좋은 점(Pro) / 아쉬운 점(Con) 요약</h3>
    </div>
    <p className="text-cg-body-sm text-cg-text">
      후기를 좋은 점 3줄, 아쉬운 점 3줄로 정성 요약하고 많이 나온 단어까지 뽑아드려요.
    </p>
    <div className="grid gap-cg-2 mt-cg-4">
      {proCon.map((row) => (
        <div key={row.text} className="flex items-start gap-cg-2 text-cg-label-sm text-cg-text">
          <span
            className={
              row.type === "pro"
                ? "shrink-0 mt-0.5 size-5 grid place-items-center rounded-cg-full bg-cg-success-soft text-cg-success"
                : "shrink-0 mt-0.5 size-5 grid place-items-center rounded-cg-full bg-cg-warning-soft text-cg-warning"
            }
          >
            {row.type === "pro" ? (
              <ThumbsUp size={12} aria-hidden="true" />
            ) : (
              <MessageCircleWarning size={12} aria-hidden="true" />
            )}
          </span>
          <span>{row.text}</span>
        </div>
      ))}
    </div>
    <div className="flex flex-wrap items-baseline gap-cg-2 mt-cg-4 pt-cg-4 border-t border-dashed border-cg-border">
      {wordCloud.map(({ word, size, color }) => (
        <b key={word} className={`font-cg-bold ${color} ${size}`}>
          {word}
        </b>
      ))}
    </div>
  </article>
);

export default ProConCard;
