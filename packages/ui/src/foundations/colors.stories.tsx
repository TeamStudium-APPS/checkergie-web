import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FoundationPage, TokenCode } from "./foundation-layout";

const colorGroups = [
  {
    title: "Brand & Action",
    description: "브랜드 인지와 핵심 행동에 사용하는 색상",
    colors: [
      ["Brand", "cg-brand", "#14038E", "핵심 CTA · 선택 · 포커스"],
      ["Brand hover", "cg-brand-hover", "#11037A", "브랜드 요소의 hover 상태"],
      ["Brand soft", "cg-brand-soft", "#F0EEFF", "선택 영역과 약한 강조"],
      ["Action", "cg-action", "#FFC857", "보조 CTA와 주의 환기"],
      ["Action hover", "cg-action-hover", "#F5B936", "Action의 hover 상태"],
    ],
  },
  {
    title: "Neutral",
    description: "콘텐츠 위계와 표면을 구성하는 기본 색상",
    colors: [
      ["Ink", "cg-ink", "#060B11", "제목과 가장 강한 텍스트"],
      ["Text", "cg-text", "#474B50", "기본 본문"],
      ["Muted", "cg-muted", "#74787C", "보조 설명"],
      ["Caption", "cg-caption", "#9EA1A4", "메타 정보와 placeholder"],
      ["Border", "cg-border", "#E5E7E9", "기본 경계와 구분선"],
      ["Canvas", "cg-canvas", "#F8F9FB", "페이지 바탕"],
      ["Surface", "cg-surface", "#FFFFFF", "카드와 입력 표면"],
    ],
  },
  {
    title: "Feedback",
    description: "결과와 시스템 상태를 일관되게 전달하는 색상",
    colors: [
      ["Danger", "cg-danger", "#EF4444", "오류와 파괴적 행동"],
      ["Success", "cg-success", "#188B70", "완료와 성공"],
      ["Warning", "cg-warning", "#B7791F", "주의가 필요한 상태"],
      ["Info", "cg-info", "#2563EB", "중립적인 안내"],
    ],
  },
] as const;

const Colors = () => null;
const meta = { title: "Foundation/Colors", component: Colors, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Colors>;
export default meta;
type Story = StoryObj<typeof meta>;

const ColorCard = ({ name, token, value, usage }: { name: string; token: string; value: string; usage: string }) => {
  return (
    <article className="min-w-0 border-b border-r border-cg-border p-4">
      <div className="h-20 border border-black/5" style={{ backgroundColor: value }} aria-label={`${name} 색상 ${value}`} />
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <strong className="text-cg-label-lg">{name}</strong>
        <span className="font-cg-mono text-cg-caption-sm text-cg-caption cg-tabular-nums">{value}</span>
      </div>
      <div className="mt-2"><TokenCode>bg-{token}</TokenCode></div>
      <p className="mt-1 text-cg-caption-sm text-cg-muted">{usage}</p>
    </article>
  );
};

export const SemanticColors: Story = {
  name: "Semantic Colors",
  render: () => (
    <FoundationPage title="Colors" description="컴포넌트에서는 HEX 값 대신 역할 기반 색상 토큰을 사용합니다.">
      <div className="space-y-10">
        {colorGroups.map((group) => (
          <section key={group.title}>
            <div className="mb-4">
              <h2 className="text-cg-title-lg">{group.title}</h2>
              <p className="mt-1 text-cg-body-sm text-cg-muted">{group.description}</p>
            </div>
            <div className="grid border-l border-t border-cg-border sm:grid-cols-2 lg:grid-cols-4">
              {group.colors.map(([name, token, value, usage]) => (
                <ColorCard key={token} name={name} token={token} value={value} usage={usage} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </FoundationPage>
  ),
};
