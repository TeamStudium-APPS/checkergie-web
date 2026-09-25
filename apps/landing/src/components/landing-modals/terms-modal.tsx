"use client";

import { Modal } from "@checkergie/ui";
import { termsEffectiveDate, termsSections } from "@checkergie/docs/terms";

export interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsModal = ({ open, onOpenChange }: TermsModalProps) => (
  <Modal open={open} onOpenChange={onOpenChange} title="이용약관" ariaLabel="이용약관">
    <div className="flex flex-col gap-cg-5">
      {termsSections.map((section) => (
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
      <p className="pt-cg-3 border-t border-cg-border text-cg-caption-sm text-cg-caption">
        본 약관은 베타 대기 페이지에 적용되는 초안이며, 정식 서비스 오픈 시 개정될 수 있습니다.
        <br />
        시행일 {termsEffectiveDate}
      </p>
    </div>
  </Modal>
);

export default TermsModal;
