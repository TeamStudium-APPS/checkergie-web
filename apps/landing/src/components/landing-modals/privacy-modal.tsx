"use client";

import { Modal } from "@checkergie/ui";

export interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const collectedItems = [
  "필수: 이메일 주소",
  "선택: 연령대, 성별 — 신청 완료 후 별도로 여쭙는 항목이며, 입력하지 않아도 베타 신청에 아무런 불이익이 없습니다.",
  "자동 수집: 접속 일시(중복 신청 방지 목적)",
];

const purposes: [string, string][] = [
  ["베타 서비스 오픈 및 정식 출시 안내", "이메일 주소"],
  ["연령대·성별에 맞는 강의 추천 구성 및 서비스 개선 통계", "선택 항목"],
];

const sections = [
  { heading: "3. 보유 및 이용 기간", body: "정식 출시 후 3개월까지 보유하며, 이용자가 수신거부 또는 삭제를 요청하는 경우 지체 없이 파기합니다." },
  { heading: "4. 제3자 제공 및 위탁", body: "수집된 정보는 출시 알림 외 다른 용도로 사용되지 않으며, 법령에 따른 경우를 제외하고 제3자에게 제공하지 않습니다. 메일 발송을 위해 외부 발송 서비스에 처리를 위탁할 수 있으며, 위탁 시 수탁자와 처리 내용을 본 방침에 고지합니다." },
  { heading: "5. 정보주체의 권리", body: "이용자는 언제든지 개인정보의 열람·정정·삭제·처리정지를 요청할 수 있습니다. 요청은 아래 연락처로 접수해 주세요." },
  { heading: "6. 개인정보 보호책임자", body: "팀 스터디움 · pcentre@studium.rehab" },
];

const PrivacyModal = ({ open, onOpenChange }: PrivacyModalProps) => (
  <Modal open={open} onOpenChange={onOpenChange} title="개인정보처리방침" ariaLabel="개인정보처리방침">
    <div className="flex flex-col gap-cg-5">
      <div>
        <h3 className="text-cg-title-sm text-cg-ink mb-cg-2">1. 수집하는 개인정보 항목</h3>
        <p className="text-cg-body-sm text-cg-text mb-cg-2">
          팀 스터디움(이하 &quot;회사&quot;)은 체커기 베타 오픈 알림을 위해 아래 항목을 수집합니다.
        </p>
        <ul className="list-disc pl-cg-5 flex flex-col gap-cg-1 text-cg-body-sm text-cg-text">
          {collectedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-cg-title-sm text-cg-ink mb-cg-2">2. 수집 및 이용 목적</h3>
        <ul className="list-disc pl-cg-5 flex flex-col gap-cg-1 text-cg-body-sm text-cg-text">
          {purposes.map(([label, note]) => (
            <li key={label}>
              {label} <span className="text-cg-caption">— {note}</span>
            </li>
          ))}
        </ul>
      </div>

      {sections.map((section) => (
        <div key={section.heading}>
          <h3 className="text-cg-title-sm text-cg-ink mb-cg-2">{section.heading}</h3>
          <p className="text-cg-body-sm text-cg-text">{section.body}</p>
        </div>
      ))}

      <p className="pt-cg-4 border-t border-cg-border text-cg-caption-sm text-cg-caption">
        본 방침은 베타 대기 페이지에 적용되는 초안이며, 정식 서비스 오픈 시 개정될 수 있습니다.
        <br />
        시행일 2026-01-01
      </p>
    </div>
  </Modal>
);

export default PrivacyModal;
