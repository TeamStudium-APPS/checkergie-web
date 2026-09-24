import { ExternalLink } from "lucide-react";
import ScoreScaleCard from "./score-scale-card";
import TagSearchCard from "./tag-search-card";
import ProConCard from "./pro-con-card";
import CurationCard from "./curation-card";
import RecommendationCard from "./recommendation-card";

const LandingSet1 = () => (
  <section
    id="set1"
    className="[scroll-margin-top:var(--landing-header-height,112px)] max-w-[1280px] mx-auto px-cg-6 [@media(width<=560px)]:px-cg-4"
    aria-labelledby="set1-title"
  >
    <div className="bg-cg-surface border border-cg-border rounded-cg-md p-cg-10 grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-cg-10 [@media(width<=1023px)]:p-cg-6">
      <div className="lg:sticky lg:top-[calc(var(--landing-header-height,112px)+var(--spacing-cg-6))] self-start">
        <span className="inline-flex items-center gap-cg-2 text-cg-label-md text-cg-muted mb-cg-4">
          Set 1 · 강의 찾기
          <span className="text-cg-caption-sm text-cg-muted bg-cg-subtle border border-cg-border rounded-cg-full px-cg-2 py-0.5">
            준비 중
          </span>
        </span>
        <h2
          id="set1-title"
          className="text-cg-heading-lg text-cg-ink [&_em]:not-italic [&_em]:text-cg-brand"
        >
          뭘 들어야 할지,
          <br />
          <em>검색부터 판단까지</em>
        </h2>
        <p className="text-cg-body-sm text-cg-text mt-cg-4">
          흩어진 강의를 태그로 좁히고, 정량·정성 평가를 나눠 보여드려요. 여기서 결정까지 끝냅니다.
        </p>
        <div className="flex items-start gap-cg-2 text-cg-label-sm text-cg-muted mt-cg-5 pt-cg-4 border-t border-cg-border">
          <ExternalLink size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>결정하고 나면 구매는 원래 강의 플랫폼으로 바로 연결돼요.</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-cg-4">
        <ScoreScaleCard className="sm:col-span-2" />
        <TagSearchCard />
        <ProConCard />
        <CurationCard />
        <RecommendationCard />
      </div>
    </div>
  </section>
);

export default LandingSet1;
