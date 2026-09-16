import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FoundationPage, TokenCode } from "./foundation-layout";

const radii = [
  ["xs", "4px", "Badge · 작은 상태 표시"],
  ["sm", "8px", "아이콘 버튼 · 입력 내부 요소"],
  ["md", "12px", "Button · TextField"],
  ["lg", "16px", "Card · Modal"],
  ["xl", "24px", "강조 카드 · 큰 표면"],
  ["full", "9999px", "Chip · Avatar · 원형 UI"],
] as const;

const componentMappings = [
  ["Chip", "full", "9999px"],
  ["Button", "md", "12px"],
  ["TextField", "md", "12px"],
  ["Card", "lg", "16px"],
  ["Modal", "lg", "16px"],
] as const;

const Radius = () => null;
const meta = { title: "Foundation/Radius", component: Radius, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Radius>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  name: "Radius Scale",
  render: () => (
    <FoundationPage title="Radius" description="컴포넌트 역할에 따라 정해진 radius 토큰을 사용합니다.">
      <div className="grid border-l border-t border-cg-border sm:grid-cols-2 lg:grid-cols-3">
        {radii.map(([name, value, usage]) => (
          <article key={name} className="border-b border-r border-cg-border p-5">
            <div className="flex h-32 items-center justify-center bg-cg-subtle">
              <div
                className="h-20 w-32 border-2 border-cg-ink bg-cg-surface"
                style={{ borderRadius: value }}
                aria-label={`${value} radius 미리보기`}
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-3">
              <TokenCode>rounded-cg-{name}</TokenCode>
              <span className="font-cg-mono text-cg-caption-sm text-cg-caption cg-tabular-nums">{value}</span>
            </div>
            <p className="mt-1 text-cg-caption-sm text-cg-muted">{usage}</p>
          </article>
        ))}
      </div>
    </FoundationPage>
  ),
};

export const ComponentMapping: Story = {
  name: "Component Mapping",
  render: () => (
    <FoundationPage title="Radius Mapping" description="컴포넌트별 기본 radius 매핑입니다.">
      <div className="overflow-x-auto border border-cg-border">
        <div className="grid grid-cols-[1fr_100px_100px] border-b border-cg-border bg-cg-subtle px-5 py-3 text-cg-label-sm text-cg-muted">
          <span>Component</span><span>Token</span><span className="text-right">Preview</span>
        </div>
        {componentMappings.map(([component, token, value]) => (
          <div key={component} className="grid grid-cols-[1fr_100px_100px] items-center border-b border-cg-border px-5 py-4 last:border-b-0">
            <strong className="text-cg-label-lg">{component}</strong>
            <TokenCode>{token}</TokenCode>
            <div className="ml-auto h-10 w-16 border-2 border-cg-brand bg-cg-brand-soft" style={{ borderRadius: value }} />
          </div>
        ))}
      </div>
    </FoundationPage>
  ),
};
