import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FoundationPage, TokenCode } from "./foundation-layout";

const spacing = [
  ["1", 4, "아이콘 내부의 미세 간격"], ["2", 8, "아이콘과 텍스트"], ["3", 12, "인라인 요소 사이"],
  ["4", 16, "기본 컴포넌트 간격"], ["5", 20, "조밀한 카드 padding"], ["6", 24, "기본 카드 padding"],
  ["8", 32, "콘텐츠 그룹 분리"], ["10", 40, "큰 컴포넌트 사이"], ["12", 48, "섹션 내부 여백"],
  ["16", 64, "큰 섹션 분리"],
] as const;

const Spacing = () => null;
const meta = { title: "Foundation/Spacing", component: Spacing, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Spacing>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  name: "Spacing Scale",
  render: () => (
    <FoundationPage title="Spacing" description="간격은 4px 기본 격자를 사용합니다. 미리보기의 두 막대 사이가 실제 토큰 값입니다.">
      <div className="overflow-x-auto border border-cg-border">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="bg-cg-subtle text-cg-label-sm text-cg-muted">
            <tr><th className="px-4 py-3 font-cg-semibold">Token</th><th className="px-4 py-3 font-cg-semibold">Preview</th><th className="px-4 py-3 text-right font-cg-semibold">Value</th><th className="px-4 py-3 font-cg-semibold">Usage</th></tr>
          </thead>
          <tbody>
            {spacing.map(([token, value, usage]) => (
              <tr key={token} className="border-t border-cg-border">
                <td className="px-4 py-4"><TokenCode>spacing-cg-{token}</TokenCode></td>
                <td className="px-4 py-4"><div className="flex items-center"><span className="h-5 w-1 bg-cg-ink" /><span style={{ width: value }} aria-label={`${value}px 간격`} /><span className="h-5 w-1 bg-cg-ink" /></div></td>
                <td className="px-4 py-4 text-right font-cg-mono text-cg-caption-sm text-cg-muted cg-tabular-nums">{value}px</td>
                <td className="px-4 py-4 text-cg-body-sm text-cg-muted">{usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FoundationPage>
  ),
};
