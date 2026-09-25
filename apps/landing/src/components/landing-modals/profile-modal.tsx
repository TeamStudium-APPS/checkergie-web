"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button, Chip, Modal } from "@checkergie/ui";

export type ProfileAge = "10s" | "20s" | "30s" | "40s" | "50s+";
export type ProfileGender = "female" | "male" | "other";

export interface ProfilePatch {
  age?: ProfileAge;
  gender?: ProfileGender;
}

export interface ProfileModalProps {
  open: boolean;
  onComplete: (result: "saved" | "skipped") => void;
  onOpenChange: (open: boolean) => void;
  onSave?: (patch: ProfilePatch) => void | Promise<void>;
}

const ageOptions: { value: ProfileAge; label: string }[] = [
  { value: "10s", label: "10대" },
  { value: "20s", label: "20대" },
  { value: "30s", label: "30대" },
  { value: "40s", label: "40대" },
  { value: "50s+", label: "50대 이상" },
];

const genderOptions: { value: ProfileGender; label: string }[] = [
  { value: "female", label: "여성" },
  { value: "male", label: "남성" },
  { value: "other", label: "기타" },
];

const ProfileModal = ({ open, onComplete, onOpenChange, onSave }: ProfileModalProps) => {
  const [age, setAge] = useState<ProfileAge>();
  const [gender, setGender] = useState<ProfileGender>();
  const [saving, setSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setAge(undefined);
      setGender(undefined);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.({ age, gender });
      onComplete("saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="신청 완료! 한 가지만 더" ariaLabel="신청 완료! 한 가지만 더">
      <div className="mb-cg-5">
        <div className="flex items-center gap-cg-2 text-cg-label-md font-cg-bold text-cg-ink mb-cg-3">
          연령대
          <em className="not-italic text-cg-caption-sm font-cg-semibold text-cg-caption bg-cg-subtle rounded-cg-full px-cg-2 py-0.5">
            선택
          </em>
        </div>
        <div className="flex flex-wrap gap-cg-2">
          {ageOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={age === option.value}
              onPress={() => setAge((current) => (current === option.value ? undefined : option.value))}
            />
          ))}
        </div>
      </div>

      <div className="mb-cg-6">
        <div className="flex items-center gap-cg-2 text-cg-label-md font-cg-bold text-cg-ink mb-cg-3">
          성별
          <em className="not-italic text-cg-caption-sm font-cg-semibold text-cg-caption bg-cg-subtle rounded-cg-full px-cg-2 py-0.5">
            선택
          </em>
        </div>
        <div className="flex flex-wrap gap-cg-2">
          {genderOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={gender === option.value}
              onPress={() => setGender((current) => (current === option.value ? undefined : option.value))}
            />
          ))}
        </div>
      </div>

      <Button fullWidth loading={saving} trailingIcon={<Check size={16} aria-hidden="true" />} onClick={handleSave}>
        저장하기
      </Button>
      <button
        type="button"
        className="block w-full text-center text-cg-body-sm font-cg-semibold text-cg-caption underline underline-offset-[3px] cursor-pointer mt-cg-3 py-cg-2 disabled:cursor-not-allowed disabled:opacity-cg-disabled"
        disabled={saving}
        onClick={() => onComplete("skipped")}
      >
        건너뛰기
      </button>

      <p className="text-cg-label-sm text-cg-caption mt-cg-4">
        선택 정보(연령대·성별)를 알려주시면 베타 오픈 때 연령대·성별에 맞는 강의를 미리 골라둘게요:)
      </p>
    </Modal>
  );
};

export default ProfileModal;
