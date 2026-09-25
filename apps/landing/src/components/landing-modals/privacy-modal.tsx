"use client";

import { Modal } from "@checkergie/ui";
import {
  privacyCollectedItems,
  privacyEffectiveDate,
  privacyPurposes,
  privacySections,
} from "@checkergie/docs/privacy";

export interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyModal = ({ open, onOpenChange }: PrivacyModalProps) => (
  <Modal open={open} onOpenChange={onOpenChange} title="개인정보처리방침" ariaLabel="개인정보처리방침">
    <div className="flex flex-col gap-cg-5">
      <div>
        <h3 className="text-cg-title-sm text-cg-ink mb-cg-2">1. 수집하는 개인정보 항목</h3>
        <p className="text-cg-body-sm text-cg-text mb-cg-2">
          팀 스터디움(이하 &quot;회사&quot;)은 체커기 베타 오픈 알림을 위해 아래 항목을 수집합니다.
        </p>
        <ul className="list-disc pl-cg-5 flex flex-col gap-cg-1 text-cg-body-sm text-cg-text">
          {privacyCollectedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-cg-title-sm text-cg-ink mb-cg-2">2. 수집 및 이용 목적</h3>
        <ul className="list-disc pl-cg-5 flex flex-col gap-cg-1 text-cg-body-sm text-cg-text">
          {privacyPurposes.map(([label, note]) => (
            <li key={label}>
              {label} <span className="text-cg-caption">— {note}</span>
            </li>
          ))}
        </ul>
      </div>

      {privacySections.map((section) => (
        <div key={section.heading}>
          <h3 className="text-cg-title-sm text-cg-ink mb-cg-2">{section.heading}</h3>
          <p className="text-cg-body-sm text-cg-text">{section.body}</p>
        </div>
      ))}

      <p className="pt-cg-4 border-t border-cg-border text-cg-caption-sm text-cg-caption">
        본 방침은 베타 대기 페이지에 적용되는 초안이며, 정식 서비스 오픈 시 개정될 수 있습니다.
        <br />
        시행일 {privacyEffectiveDate}
      </p>
    </div>
  </Modal>
);

export default PrivacyModal;
