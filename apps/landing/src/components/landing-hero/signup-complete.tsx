"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2, Sparkles } from "lucide-react";
import { Button } from "@checkergie/ui";

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
      className={`[--landing-receipt:#287dbe] [--completion-mint:var(--landing-accent)] [scroll-margin-top:var(--landing-header-height,112px)] [background:radial-gradient(ellipse_at_92%_0%,color-mix(in_srgb,var(--landing-accent)_18.04%,transparent),transparent_38%),linear-gradient(120deg,var(--color-cg-brand),var(--landing-gradient-deep)_65%,var(--landing-gradient-end))] grid place-items-center text-cg-surface ${
        compact
          ? `py-14 min-h-0 px-cg-6`
          : "min-h-[calc(100svh_-_var(--landing-header-height,_112px))] px-cg-6 py-cg-16"
      }`}
      aria-labelledby={`${id}-title`}
    >
      <div
        className="[&_:is(h1,h2)]:outline-none [&_:is(h1,h2)_span]:text-[var(--completion-mint)] [@media(width<=560px)]:[&_:is(h1,h2)]:text-cg-display-sm w-full max-w-[680px] text-center"
      >
        <Heading
          ref={heading}
          tabIndex={-1}
          id={`${id}-title`}
          className="text-cg-display-lg"
        >
          자리, <span>맡아뒀어요.</span>
        </Heading>

        <p className="mt-cg-5 mx-auto mb-9 text-[var(--landing-text-inverse)] text-cg-body-md">
          이제 기다리기만 하면 돼요. 같이 완강할 친구에게도 알려주세요.
        </p>

        <div className="py-7 px-cg-5 border border-[var(--landing-accent)]/[0.302] bg-[var(--landing-receipt)]/20 [&_strong]:text-[var(--completion-mint)] [&_p]:mt-2.5 [&_p]:text-[var(--landing-text-inverse)] max-w-[560px] m-auto rounded-cg-lg">
          <span
            className="size-9 mx-auto mb-3.5 bg-[var(--completion-mint)] text-[var(--landing-on-accent)] text-cg-heading-md grid place-items-center rounded-cg-full"
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
          className="mt-cg-5 mb-cg-4 flex flex-wrap justify-center gap-cg-3"
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
              className="[&&]:bg-cg-surface/[0.051] [&&]:text-cg-surface [&&]:border-cg-surface/[0.251]"
              onClick={onOpenProfile}
            >
              맞춤 추천 받기
            </Button>
          )}
        </div>

        <button
          type="button"
          className="text-[var(--landing-text-inverse)] disabled:cursor-not-allowed disabled:opacity-cg-disabled focus-visible:outline-2 focus-visible:outline-[var(--completion-mint)] focus-visible:outline-offset-[3px] text-cg-caption-sm underline underline-offset-[4px] cursor-pointer p-cg-2 rounded-cg-sm"
          onClick={onReset}
          disabled={!onReset}
        >
          다른 이메일로 신청하기
        </button>

        <p
          className="text-[var(--landing-text-inverse)] text-cg-body-sm min-h-[24px] mt-cg-3"
          role="status"
        >
          {message}
        </p>
      </div>
    </section>
  );
};

export default SignupComplete;
