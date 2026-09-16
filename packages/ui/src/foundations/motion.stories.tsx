import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { FoundationPage, TokenCode } from "./foundation-layout";

const durations = [
  ["instant", "80ms", "즉각적인 상태 피드백"],
  ["fast", "100ms", "버튼 press와 작은 아이콘"],
  ["base", "150ms", "색상과 일반 상태 전환"],
  ["slow", "240ms", "표면 진입과 강조 전환"],
] as const;

const easings = [
  ["standard", "cubic-bezier(0.2, 0, 0, 1)", "일반 상태 전환"],
  ["emphasized", "cubic-bezier(0.2, 0.8, 0.2, 1)", "진입과 강조"],
  ["exit", "cubic-bezier(0.4, 0, 1, 1)", "빠른 퇴출"],
] as const;

const Motion = () => null;
const meta = { title: "Foundation/Motion", component: Motion, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Motion>;
export default meta;
type Story = StoryObj<typeof meta>;

const MotionPreview = () => {
  const [active, setActive] = useState(false);

  return (
    <FoundationPage title="Motion" description="인터랙션 목적에 맞는 duration과 easing 토큰을 사용합니다.">
      <button type="button" aria-pressed={active} onClick={() => setActive((current) => !current)} className="cg-button-press mb-6 cursor-pointer border border-cg-border bg-cg-surface px-4 py-2.5 text-cg-label-lg hover:bg-cg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cg-brand/25">
        {active ? "원위치" : "모션 재생"}
      </button>
      <div className="border border-cg-border">
        {durations.map(([name, duration, usage]) => (
          <div key={name} className="grid grid-cols-[110px_minmax(0,1fr)_70px] items-center gap-4 border-b border-cg-border p-4 last:border-b-0">
            <TokenCode>duration-cg-{name}</TokenCode>
            <div className="h-2 overflow-hidden bg-cg-subtle">
              <div
                className="h-full origin-left bg-cg-brand motion-reduce:transition-none"
                style={{ transform: active ? "scaleX(1)" : "scaleX(.12)", transition: `transform ${duration} var(--ease-cg-standard)` }}
              />
            </div>
            <span className="text-right font-cg-mono text-cg-caption-sm text-cg-caption cg-tabular-nums">{duration}</span>
            <p className="col-start-2 text-cg-caption-sm text-cg-muted">{usage}</p>
          </div>
        ))}
      </div>
    </FoundationPage>
  );
};

export const Durations: Story = { render: () => <MotionPreview /> };

export const Easings: Story = {
  render: () => (
    <FoundationPage title="Motion Easings" description="상태 변화, 진입과 퇴출에 맞는 easing 토큰을 선택합니다.">
      <div className="grid border-l border-t border-cg-border md:grid-cols-3">
        {easings.map(([name, value, usage]) => (
          <div key={name} className="border-b border-r border-cg-border p-5">
            <TokenCode>ease-cg-{name}</TokenCode>
            <p className="mt-4 break-all font-cg-mono text-cg-caption-sm text-cg-caption">{value}</p>
            <p className="mt-2 text-cg-body-sm text-cg-muted">{usage}</p>
          </div>
        ))}
      </div>
    </FoundationPage>
  ),
};
