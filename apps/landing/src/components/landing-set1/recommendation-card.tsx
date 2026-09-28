"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@checkergie/ui";

const recommendations = [
  { rank: 1, title: "한 달 완성 토익 RC 실전 패키지", why: "평일 저녁 40분 · 난이도 3", score: "6.2" },
  { rank: 2, title: "기초부터 다지는 LC 청취 훈련", why: "하루 35분 · 난이도 2", score: "5.8" },
  { rank: 3, title: "직장인 새벽 30분 영단어 루틴", why: "하루 25분 · 난이도 1", score: "5.1" },
  { rank: 4, title: "토익 파트 5·6 문법 집중 공략", why: "평일 저녁 30분 · 난이도 2", score: "4.9" },
  { rank: 5, title: "출퇴근 20분 LC 쉐도잉", why: "하루 20분 · 난이도 2", score: "4.7" },
  { rank: 6, title: "3개월 토익 700 로드맵", why: "주 3회 50분 · 난이도 3", score: "4.5" },
];

const PAGE_SIZE = 3;
const pages = Array.from({ length: Math.ceil(recommendations.length / PAGE_SIZE) }, (_, index) =>
  recommendations.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE),
);

type Recommendation = (typeof recommendations)[number];

const RecommendationRow = ({ item }: { item: Recommendation }) => (
  <div className="flex items-center gap-cg-3 bg-cg-subtle border border-cg-border rounded-cg-md px-cg-3 py-cg-2">
    <span className="size-[18px] shrink-0 grid place-items-center rounded-cg-full bg-cg-border text-cg-caption-sm font-cg-bold text-cg-text">
      {item.rank}
    </span>
    <div className="flex-1 min-w-0">
      <strong className="block text-cg-body-sm font-cg-bold text-cg-ink truncate">{item.title}</strong>
      <span className="flex items-center gap-cg-1 text-cg-caption-sm text-cg-muted">
        <Check size={11} className="shrink-0" aria-hidden="true" />
        <span className="truncate">{item.why}</span>
      </span>
    </div>
    <span className="shrink-0 text-cg-body-md font-cg-bold text-cg-ink">
      {item.score}
      <i className="not-italic text-cg-caption-sm font-cg-medium text-cg-muted ml-0.5">/7</i>
    </span>
  </div>
);

const RecommendationCard = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const isLastPage = page === pages.length - 1;

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setPage(Math.round(track.scrollTop / track.clientHeight));
  };

  const handleMore = () => {
    const track = trackRef.current;
    if (!track) return;
    const nextPage = isLastPage ? 0 : page + 1;
    // 스크롤 속도는 트랙의 scroll-smooth(감소된 모션에서는 즉시 이동)를 따른다.
    track.scrollTo({ top: nextPage * track.clientHeight });
  };

  return (
    <article className="bg-cg-surface border border-cg-border rounded-cg-md p-cg-6 shadow-cg-sm hover:shadow-cg-card hover:-translate-y-0.5 transition-[transform,box-shadow] duration-cg-base motion-reduce:transition-none flex flex-col">
      <div className="flex items-center gap-cg-3 mb-cg-3">
        <Sparkles size={22} className="text-cg-ink" aria-hidden="true" />
        <h3 className="text-cg-title-lg text-cg-ink">추천 결과</h3>
      </div>
      <p className="text-cg-body-sm text-cg-text">
        찾은 강의를 조건에 잘 맞는 순서로 세워드려요. 왜 골랐는지 이유까지 함께요.
      </p>
      <div className="relative mt-cg-4">
        {/* 첫 페이지와 같은 높이를 확보하는 자리 표시용 사본. 트랙은 이 높이 안에서 세로로 스크롤된다. */}
        <div className="invisible grid grid-cols-1 gap-cg-2" aria-hidden="true">
          {pages[0].map((item) => (
            <RecommendationRow key={item.rank} item={item} />
          ))}
        </div>
        <div
          ref={trackRef}
          onScroll={handleScroll}
          role="region"
          aria-label={`추천 강의 ${page * PAGE_SIZE + 1}~${Math.min((page + 1) * PAGE_SIZE, recommendations.length)}위`}
          tabIndex={0}
          className="absolute inset-0 overflow-y-auto snap-y snap-mandatory scroll-smooth motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-cg-md outline-none focus-visible:ring-2 focus-visible:ring-cg-brand/20"
        >
          {pages.map((items, index) => (
            <div key={index} className="grid grid-cols-1 gap-cg-2 h-full snap-start">
              {items.map((item) => (
                <RecommendationRow key={item.rank} item={item} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        fullWidth
        onClick={handleMore}
        leadingIcon={isLastPage ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        className="border border-dashed border-cg-border-strong mt-cg-4 [&&]:rounded-cg-md [&&]:text-cg-label-sm [&&]:hover:text-cg-text"
      >
        {isLastPage ? "처음 추천 강의 다시 보기" : `조건에 맞는 강의 ${PAGE_SIZE}개 더 보기`}
      </Button>
    </article>
  );
};

export default RecommendationCard;
