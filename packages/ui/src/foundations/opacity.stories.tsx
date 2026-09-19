import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FoundationPage, TokenCode } from "./foundation-layout";
const opacities = [["disabled", "opacity-cg-disabled", "0.45", "비활성 컴포넌트"], ["muted", "opacity-cg-muted", "0.65", "약한 보조 정보"]] as const;
const Opacity = () => null;
const meta = { title: "Foundation/Opacity", component: Opacity, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Opacity>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SemanticOpacity: Story = { render: () => (
  <FoundationPage title="Opacity" description="상태 표현에는 의미 기반 opacity 토큰을 사용합니다.">
    <div className="grid border-l border-t border-cg-border sm:grid-cols-2">
      {opacities.map(([name, opacityClass, value, usage]) => (
        <article key={name} className="border-b border-r border-cg-border p-5">
          <div className="bg-cg-subtle p-4"><div className={`h-16 bg-cg-brand ${opacityClass}`} /></div>
          <div className="mt-4 flex items-baseline justify-between gap-3"><TokenCode>opacity-cg-{name}</TokenCode><span className="font-cg-mono text-cg-caption-sm text-cg-caption cg-tabular-nums">{value}</span></div>
          <p className="mt-1 text-cg-caption-sm text-cg-muted">{usage}</p>
        </article>
      ))}
    </div>
  </FoundationPage>
) };
