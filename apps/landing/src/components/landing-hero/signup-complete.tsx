"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2, Sparkles } from "lucide-react";
import { Button } from "@checkergie/ui";
import styles from "./signup-complete.module.css";

export interface SignupCompleteProps {
  id?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onReset?: () => void;
  onOpenProfile?: () => void;
  profileSaved?: boolean;
}

const SignupComplete = ({
  id = "hero-signup",
  compact = false,
  autoFocus = true,
  onReset,
  onOpenProfile,
  profileSaved = false,
}: SignupCompleteProps) => {
  const heading = useRef<HTMLHeadingElement>(null);
  const [message, setMessage] = useState("");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (autoFocus) heading.current?.focus();
  }, [autoFocus]);
  const Heading = compact ? "h2" : "h1";

  const share = async () => {
    setSharing(true);
    setMessage("");
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "체커기",
          text: "고민은 짧게, 강의 수강은 끝까지. 체커기를 만나보세요.",
          url: url.href,
        });
      } else {
        await navigator.clipboard.writeText(url.href);
        setMessage("링크를 복사했어요. 친구에게 공유해 주세요!");
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        setMessage("공유하지 못했어요. 주소창의 링크를 복사해 주세요.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <section
      id={id}
      className={`${styles.complete} grid place-items-center text-cg-surface ${
        compact
          ? `${styles.compact} min-h-0 px-cg-6`
          : "min-h-[calc(100svh_-_var(--landing-header-height,_112px))] px-cg-6 py-cg-16"
      }`}
      aria-labelledby={`${id}-title`}
    >
      <div
        className={`${styles.content} w-full max-w-[680px] text-center`}
      >
        <Heading
          ref={heading}
          tabIndex={-1}
          id={`${id}-title`}
          className="text-cg-display-lg"
        >
          자리, <span>맡아뒀어요.</span>
        </Heading>

        <p className={`${styles.description} text-cg-body-md`}>
          이제 기다리기만 하면 돼요. 같이 완강할 친구에게도 알려주세요.
        </p>

        <div className={`${styles.receipt} max-w-[560px] m-auto rounded-cg-lg`}>
          <span
            className={`${styles.receiptIcon} text-cg-heading-md grid place-items-center rounded-cg-full`}
            aria-hidden="true"
          >
            <Check size={24} />
          </span>

          <strong className="text-cg-title-md">
            정상적으로 등록됐어요!
          </strong>

          <p className="text-cg-body-sm">
            오픈하면 등록하신 메일로 가장 먼저 알려드릴게요.
          </p>
        </div>

        <div
          className={`${styles.actions} flex flex-wrap justify-center gap-cg-3`}
        >
          <Button
            onClick={share}
            loading={sharing}
            trailingIcon={<Share2 size={16} />}
          >
            친구에게 알려주기
          </Button>

          {!profileSaved && (
            <Button
              variant="outline"
              trailingIcon={<Sparkles size={16} />}
              className={styles.profileButton}
              onClick={onOpenProfile}
            >
              맞춤 추천 받기
            </Button>
          )}
        </div>

        <button
          type="button"
          className={`${styles.resetButton} text-cg-caption-sm underline underline-offset-[4px] cursor-pointer p-cg-2 rounded-cg-sm`}
          onClick={onReset}
          disabled={!onReset}
        >
          다른 이메일로 신청하기
        </button>

        <p
          className={`${styles.status} text-cg-body-sm min-h-[24px] mt-cg-3`}
          role="status"
        >
          {message}
        </p>
      </div>
    </section>
  );
};

export default SignupComplete;
