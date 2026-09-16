import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FoundationPage, TokenCode } from "./foundation-layout";
const elevations = [["sm", "shadow-cg-sm", "작은 분리와 인라인 팝업"], ["card", "shadow-cg-card", "카드와 부유 표면"], ["float", "shadow-cg-float", "드롭다운과 팝오버"], ["modal", "shadow-cg-modal", "최상위 다이얼로그"]] as const;
const Elevation = () => null;
const meta = { title: "Foundation/Elevation", component: Elevation, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Elevation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Levels: Story = { render: () => (
  <FoundationPage title="Elevation" description="레이어 높이에 따라 정해진 shadow 토큰을 사용합니다.">
    <div className="grid border-l border-t border-cg-border sm:grid-cols-2">
      {elevations.map(([name, shadowClass, usage]) => (
        <article key={name} className="border-b border-r border-cg-border p-5">
          <div className="flex h-28 items-center justify-center bg-cg-subtle">
            <div className={`h-14 w-32 bg-cg-surface ${shadowClass}`} aria-label={`${name} 그림자 미리보기`} />
          </div>
          <div className="mt-4"><TokenCode>shadow-cg-{name}</TokenCode></div>
          <p className="mt-1 text-cg-caption-sm text-cg-muted">{usage}</p>
        </article>
      ))}
    </div>
  </FoundationPage>
) };
