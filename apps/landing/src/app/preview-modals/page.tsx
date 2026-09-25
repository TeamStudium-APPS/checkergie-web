"use client";

import { useState } from "react";
import TermsModal from "../../components/landing-modals/terms-modal";
import PrivacyModal from "../../components/landing-modals/privacy-modal";
import ProfileModal from "../../components/landing-modals/profile-modal";

export default function PreviewModalsPage() {
  const [openModal, setOpenModal] = useState<"terms" | "privacy" | "profile" | null>(null);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-cg-4 bg-cg-canvas p-cg-10">
      <p className="text-cg-body-sm text-cg-muted mb-cg-2">
        임시 미리보기 페이지 / 머지 전 삭제예정
      </p>
      <button
        type="button"
        className="rounded-cg-full bg-cg-brand text-cg-surface px-cg-6 py-cg-3 cursor-pointer"
        onClick={() => setOpenModal("terms")}
      >
        이용약관 열기
      </button>
      <button
        type="button"
        className="rounded-cg-full bg-cg-brand text-cg-surface px-cg-6 py-cg-3 cursor-pointer"
        onClick={() => setOpenModal("privacy")}
      >
        개인정보처리방침 열기
      </button>
      <button
        type="button"
        className="rounded-cg-full bg-cg-action text-cg-ink px-cg-6 py-cg-3 cursor-pointer"
        onClick={() => setOpenModal("profile")}
      >
        신청 완료 모달 열기
      </button>

      <TermsModal open={openModal === "terms"} onOpenChange={(open) => !open && setOpenModal(null)} />
      <PrivacyModal open={openModal === "privacy"} onOpenChange={(open) => !open && setOpenModal(null)} />
      <ProfileModal
        open={openModal === "profile"}
        onOpenChange={(open) => !open && setOpenModal(null)}
        onComplete={() => setOpenModal(null)}
      />
    </div>
  );
}
