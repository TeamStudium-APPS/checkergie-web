"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { Button, Chip, Modal } from "@checkergie/ui";
import { ageGroupSchema, genderSchema, type AgeGroup as ProfileAgeGroup, type Gender as ProfileGender } from "@checkergie/api";

export interface ProfileModalProps {
  open: boolean;
  onComplete: (result: "saved" | "skipped") => void;
  onOpenChange: (open: boolean) => void;
  onSave?: (patch: { ageGroup?: ProfileAgeGroup; gender?: ProfileGender }) => void | Promise<void>;
}

const SAVE_ERROR_MESSAGE = "저장에 실패했어요. 다시 시도해 주세요.";
const SAVE_HINT_MESSAGE = "연령대 또는 성별을 선택하면 저장할 수 있어요";

const ProfileModal = ({ open, onComplete, onOpenChange, onSave }: ProfileModalProps) => {
  const [ageGroup, setAgeGroup] = useState<ProfileAgeGroup>();
  const [gender, setGender] = useState<ProfileGender>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState<{ ageGroup?: ProfileAgeGroup; gender?: ProfileGender }>({});
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setAgeGroup(saved.ageGroup);
      setGender(saved.gender);
      setSaveError(false);
    }
  }

  const hasSelection = ageGroup !== undefined || gender !== undefined;
  const hasSaved = saved.ageGroup !== undefined || saved.gender !== undefined;
  const hasChanges = ageGroup !== saved.ageGroup || gender !== saved.gender;

  const handleSave = async () => {
    // 클릭은 결과와 관계없이 profile_submit으로, 결과는 profile_submit_result로 나눠 집계한다.
    // GA 관리에서 age_group, gender를 맞춤 측정기준으로 등록해야 보고서에서 나눠 볼 수 있다.
    sendGAEvent("event", "profile_submit", { age_group: ageGroup ?? "none", gender: gender ?? "none" });
    setSaving(true);
    setSaveError(false);
    try {
      await onSave?.({ ageGroup, gender });
      sendGAEvent("event", "profile_submit_result", { result: "success" });
      setSaved({ ageGroup, gender });
      onComplete("saved");
    } catch {
      sendGAEvent("event", "profile_submit_result", { result: "error" });
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        // Modal은 바깥 클릭, ESC, X 버튼으로 닫힐 때만 onOpenChange를 호출한다.
        if (!next) sendGAEvent("event", "profile_dismiss");
        onOpenChange(next);
      }}
      dismissible={!saving}
      title="신청 완료! 한 가지만 더"
      ariaLabel="신청 완료! 한 가지만 더"
    >
      <div className="mb-cg-5">
        <div className="flex items-center gap-cg-2 text-cg-label-md font-cg-bold text-cg-ink mb-cg-3">
          연령대
          <em className="not-italic text-cg-caption-sm font-cg-semibold text-cg-caption bg-cg-subtle rounded-cg-full px-cg-2 py-0.5">
            택1 선택
          </em>
        </div>
        <div className="flex flex-wrap gap-cg-2">
          {ageGroupSchema.options.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={ageGroup === option}
              onPress={() => {
                sendGAEvent("event", "profile_option_click", { field: "age_group", option, selected: ageGroup !== option });
                setAgeGroup((current) => (current === option ? undefined : option));
              }}
            />
          ))}
        </div>
      </div>

      <div className="mb-cg-6">
        <div className="flex items-center gap-cg-2 text-cg-label-md font-cg-bold text-cg-ink mb-cg-3">
          성별
          <em className="not-italic text-cg-caption-sm font-cg-semibold text-cg-caption bg-cg-subtle rounded-cg-full px-cg-2 py-0.5">
            택1 선택
          </em>
        </div>
        <div className="flex flex-wrap gap-cg-2">
          {genderSchema.options.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={gender === option}
              onPress={() => {
                sendGAEvent("event", "profile_option_click", { field: "gender", option, selected: gender !== option });
                setGender((current) => (current === option ? undefined : option));
              }}
            />
          ))}
        </div>
      </div>

      {saveError ? (
        <p role="alert" className="text-cg-label-sm text-cg-danger mb-cg-2">
          {SAVE_ERROR_MESSAGE}
        </p>
      ) : !hasSelection && !hasSaved ? (
        <p className="text-cg-label-sm text-cg-caption mb-cg-2">{SAVE_HINT_MESSAGE}</p>
      ) : null}
      <Button
        fullWidth
        loading={saving}
        disabled={!hasChanges}
        trailingIcon={<Check size={16} aria-hidden="true" />}
        onClick={handleSave}
      >
        저장하기
      </Button>
      <button
        type="button"
        className="block w-full text-center text-cg-body-sm font-cg-semibold text-cg-caption underline underline-offset-[3px] cursor-pointer mt-cg-3 py-cg-2 disabled:cursor-not-allowed disabled:opacity-cg-disabled"
        disabled={saving}
        onClick={() => {
          sendGAEvent("event", "profile_skip");
          onComplete("skipped");
        }}
      >
        건너뛰기
      </button>

      <p className="text-cg-label-sm text-cg-caption mt-cg-4 mb-cg-3 sm:mb-cg-4">
        선택 정보(연령대·성별)를 알려주시면 베타 오픈 때 연령대·성별에 맞는 강의를 미리 골라둘게요:)
      </p>
    </Modal>
  );
};

export default ProfileModal;
