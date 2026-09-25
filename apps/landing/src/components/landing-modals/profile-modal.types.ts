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
