"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Chip } from "@checkergie/ui";

const tags = [
  { label: "난이도 3", active: true },
  { label: "강의형", active: true },
  { label: "실습형", active: false },
  { label: "#자격증", active: false },
  { label: "#단기완성", active: false },
  { label: "#자료충실", active: false },
];

const TOTAL_COUNT = 1284;
// 데모용 결과 수. 선택한 조건 개수에 따라 좁혀지는 모습만 보여준다.
const resultCounts = [TOTAL_COUNT, 412, 37, 12, 5, 2, 1];

const TagSearchCard = () => {
  const [selected, setSelected] = useState(
    () => new Set(tags.filter((tag) => tag.active).map((tag) => tag.label)),
  );
  const resultCount = resultCounts[selected.size];

  const toggleTag = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <article className="bg-cg-surface border border-cg-border rounded-cg-md p-cg-6 shadow-cg-sm hover:shadow-cg-card hover:-translate-y-0.5 transition-[transform,box-shadow] duration-cg-base motion-reduce:transition-none flex flex-col">
      <div className="flex items-center gap-cg-3 mb-cg-3">
        <Search size={22} className="text-cg-ink" aria-hidden="true" />
        <h3 className="text-cg-title-lg text-cg-ink">태그 검색</h3>
      </div>
      <p className="text-cg-body-sm text-cg-text flex-1">
        난이도, 강의 방식, 분야까지 태그로 조합해 원하는 조건의 강의만 좁혀서 찾아요.
      </p>
      <div className="flex flex-wrap gap-cg-2 mt-cg-4">
        {tags.map((tag) => (
          <Chip
            key={tag.label}
            label={tag.label}
            size="sm"
            selected={selected.has(tag.label)}
            onPress={() => toggleTag(tag.label)}
          />
        ))}
      </div>
      <div className="flex justify-between text-cg-caption-sm text-cg-muted mt-cg-3">
        <span>조건 {selected.size}개 선택</span>
        <span aria-live="polite">
          {TOTAL_COUNT.toLocaleString("ko-KR")}개 → {resultCount.toLocaleString("ko-KR")}개
        </span>
      </div>
    </article>
  );
};

export default TagSearchCard;
