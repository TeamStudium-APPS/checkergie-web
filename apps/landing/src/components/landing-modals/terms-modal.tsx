"use client";

import { Modal } from "@checkergie/ui";

export interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sections = [
  {
    heading: "제1조 (목적)",
    body: '본 약관은 팀 스터디움이 제공하는 "체커기" 베타 대기 등록 서비스의 이용 조건과 절차를 정하는 것을 목적으로 합니다.',
  },
  {
    heading: "제2조 (서비스의 내용)",
    list: [
      "회사는 여러 온라인 강의 플랫폼의 강의 정보를 모아 비교·평가·추천하는 서비스를 준비 중입니다.",
      "본 페이지는 정식 출시 전 베타 참여 의사를 남기는 목적의 사전 등록 페이지입니다.",
    ],
  },
  {
    heading: "제3조 (강의 구매 및 결제)",
    body: "강의 구매와 결제는 각 원본 강의 플랫폼에서 이루어지며, 회사는 강의의 내용·품질·환불에 대해 해당 플랫폼 및 판매자의 정책을 따릅니다.",
  },
  {
    heading: "제4조 (평점 및 후기)",
    body: "회사는 7점 척도 평점과 후기 요약을 제공합니다. 평점 산정 시 상·하위 극단값을 제외하는 등 자체 기준을 적용하며, 추천 로직은 광고 수익과 분리하여 운영합니다.",
  },
  {
    heading: "제5조 (면책)",
    body: "베타 서비스는 기능이 예고 없이 변경·중단될 수 있으며, 회사는 무상으로 제공되는 베타 기간 중 발생한 손해에 대해 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.",
  },
];

const TermsModal = ({ open, onOpenChange }: TermsModalProps) => (
  <Modal open={open} onOpenChange={onOpenChange} title="이용약관" ariaLabel="이용약관">
    <div className="flex flex-col gap-cg-5">
      {sections.map((section) => (
        <div key={section.heading}>
          <h3 className="text-cg-title-sm text-cg-ink mb-cg-2">{section.heading}</h3>
          {section.list ? (
            <ul className="list-disc pl-cg-5 flex flex-col gap-cg-1 text-cg-body-sm text-cg-text">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-cg-body-sm text-cg-text">{section.body}</p>
          )}
        </div>
      ))}
      <p className="pt-cg-4 border-t border-cg-border text-cg-caption-sm text-cg-caption">
        본 약관은 베타 대기 페이지에 적용되는 초안이며, 정식 서비스 오픈 시 개정될 수 있습니다.
        <br />
        시행일 2026-01-01
      </p>
    </div>
  </Modal>
);

export default TermsModal;
