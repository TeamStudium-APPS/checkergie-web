import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FoundationPage, TokenCode } from "./foundation-layout";

const typeGroups = [
  { name: "Display", usage: "핵심 메시지와 큰 화면 타이틀", styles: [["Large", "text-cg-display-lg", "48 / 60 · 700 · -2%"], ["Medium", "text-cg-display-md", "40 / 50 · 700 · -2%"], ["Small", "text-cg-display-sm", "32 / 40 · 700 · -1.5%"]] },
  { name: "Heading", usage: "페이지와 섹션의 정보 위계", styles: [["Large", "text-cg-heading-lg", "28 / 36 · 700 · -1%"], ["Medium", "text-cg-heading-md", "24 / 32 · 700 · -1%"], ["Small", "text-cg-heading-sm", "20 / 28 · 700"]] },
  { name: "Title", usage: "카드 제목과 강조 UI 텍스트", styles: [["Large", "text-cg-title-lg", "18 / 24 · 600"], ["Medium", "text-cg-title-md", "16 / 24 · 600"], ["Small", "text-cg-title-sm", "14 / 20 · 600"]] },
  { name: "Body", usage: "설명과 일반 본문", styles: [["Large", "text-cg-body-lg", "16 / 24 · 400"], ["Medium", "text-cg-body-md", "15 / 22.5 · 400"], ["Small", "text-cg-body-sm", "14 / 20 · 400"]] },
  { name: "Label", usage: "버튼과 입력 라벨", styles: [["Large", "text-cg-label-lg", "14 / 20 · 600"], ["Medium", "text-cg-label-md", "13 / 18 · 600 · +1%"], ["Small", "text-cg-label-sm", "12 / 16 · 600 · +2%"]] },
  { name: "Supporting", usage: "메타 정보와 범주 라벨", styles: [["Caption", "text-cg-caption-sm", "12 / 16 · 400 · +2%"], ["Overline", "text-cg-overline", "12 / 16 · 700 · +8%"]] },
] as const;

const weights = [
  ["Thin", "font-thin", "100"], ["Extra Light", "font-extralight", "200"], ["Light", "font-light", "300"],
  ["Regular", "font-cg-regular", "400"], ["Medium", "font-cg-medium", "500"], ["Semi Bold", "font-cg-semibold", "600"],
  ["Bold", "font-cg-bold", "700"], ["Extra Bold", "font-cg-extrabold", "800"], ["Black", "font-black", "900"],
] as const;

const Typography = () => null;
const meta = { title: "Foundation/Typography", component: Typography, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Typography>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SemanticScale: Story = {
  name: "Semantic Scale",
  render: () => (
    <FoundationPage title="Typography" description="Pretendard를 사용합니다. 크기, 행간, 자간과 굵기는 역할 기반 토큰으로 적용합니다.">
      <div className="space-y-10">
        {typeGroups.map((group) => (
          <section key={group.name}>
            <div className="mb-3">
              <h2 className="text-cg-title-lg">{group.name}</h2>
              <p className="mt-1 text-cg-body-sm text-cg-muted">{group.usage}</p>
            </div>
            <div className="border border-cg-border">
              {group.styles.map(([name, className, specification]) => (
                <div key={name} className="grid gap-3 border-b border-cg-border p-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
                  <p className={className}>건강한 선택을 더 쉽게</p>
                  <div className="min-w-0 text-cg-caption-sm text-cg-muted md:text-right"><TokenCode>{className}</TokenCode><span className="mt-1 block">{specification}</span></div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </FoundationPage>
  ),
};

export const FontWeights: Story = {
  name: "Font Weights",
  render: () => (
    <FoundationPage title="Pretendard Font Weights" description="Pretendard 100–900 굵기를 로컬 WOFF2 파일로 제공합니다.">
      <div className="grid border-l border-t border-cg-border sm:grid-cols-2 lg:grid-cols-3">
        {weights.map(([name, className, value]) => (
          <div key={name} className="border-b border-r border-cg-border p-5">
            <p className={`text-cg-title-lg ${className}`}>프리텐다드 Pretendard 0123</p>
            <p className="mt-3 text-cg-caption-sm text-cg-caption">{name} · {value}</p>
          </div>
        ))}
      </div>
    </FoundationPage>
  ),
};

export const Utilities: Story = {
  name: "Text Utilities",
  render: () => (
    <FoundationPage title="Text Utilities" description="반복되는 가독성 규칙을 공통 유틸리티로 제공합니다.">
      <div className="grid border-l border-t border-cg-border md:grid-cols-3">
        <div className="border-b border-r border-cg-border p-5"><TokenCode>cg-text-balance</TokenCode><p className="cg-text-balance mt-3 text-cg-title-md">제목의 마지막 줄이 외롭게 남지 않도록 균형을 맞춥니다</p></div>
        <div className="border-b border-r border-cg-border p-5"><TokenCode>cg-tabular-nums</TokenCode><p className="cg-tabular-nums mt-3 text-cg-title-md">12,480 · 09:41 · 87.5%</p></div>
        <div className="border-b border-r border-cg-border p-5"><TokenCode>cg-legible-identifier</TokenCode><p className="cg-legible-identifier mt-3 text-cg-title-md">Il1 · O0 · A19B0</p></div>
      </div>
    </FoundationPage>
  ),
};
